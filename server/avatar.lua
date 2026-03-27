Avatar = Avatar or {}
local cfg = AvatarConfig

local cacheByIdentifier = {}
local discordApiBase = 'https://discord.com/api/'

---@param playerId number
---@return string|nil
local function getPlayerIdentifier(playerId)
    local identifier = Bridge.framework.GetPlayerIdentifier(playerId)
    if type(identifier) ~= 'string' or identifier == '' then
        return nil
    end
    return identifier
end

---@param playerId number
---@return string|nil
local function getCachedAvatar(playerId)
    local identifier = getPlayerIdentifier(playerId)
    if not identifier then
        return nil
    end
    return cacheByIdentifier[identifier]
end

---@param playerId number
---@param avatar string
---@return nil
local function setCachedAvatar(playerId, avatar)
    local identifier = getPlayerIdentifier(playerId)
    if not identifier then
        return
    end
    cacheByIdentifier[identifier] = avatar
end

---@param guildId string
---@param discordId string
---@return table|nil
local function fetchDiscordMember(guildId, discordId)
    local token = ('Bot %s'):format(cfg.discord and cfg.discord.token or '')
    local endpoint = ('guilds/%s/members/%s'):format(guildId, discordId)
    local promiseHandle = promise.new()
    PerformHttpRequest(discordApiBase .. endpoint, function(statusCode, body)
        if statusCode ~= 200 or not body or body == '' then
            promiseHandle:resolve(nil)
            return
        end
        local ok, decoded = pcall(json.decode, body)
        if not ok or type(decoded) ~= 'table' or type(decoded.user) ~= 'table' then
            promiseHandle:resolve(nil)
            return
        end
        promiseHandle:resolve(decoded.user)
    end, 'GET', '', {
        ['Content-Type'] = 'application/json',
        ['Authorization'] = token,
    })
    return Citizen.Await(promiseHandle)
end

---@param avatarHash string|nil
---@param discordId string
---@return string
local function buildDiscordAvatarUrl(avatarHash, discordId)
    if not avatarHash or avatarHash == '' then
        return ('https://cdn.discordapp.com/embed/avatars/%s.png'):format(tonumber(discordId) % 5)
    end
    local isGif = avatarHash:sub(1, 2) == 'a_'
    local ext = isGif and 'gif' or 'png'
    return ('https://cdn.discordapp.com/avatars/%s/%s.%s'):format(discordId, avatarHash, ext)
end

---@param playerId number
---@return string|nil
local function getMugshotAvatar(playerId)
    local mugshotCfg = cfg.mugshot64
    if type(mugshotCfg) ~= 'table' or type(mugshotCfg.callback) ~= 'string' then
        return nil
    end
    local raw = lib.callback.await(mugshotCfg.callback, playerId)
    if type(raw) ~= 'string' or raw == '' then
        return nil
    end
    if raw:find('^data:') then
        return raw
    end
    return 'data:image/png;base64,' .. raw
end

---@param playerId number
---@return string|nil
local function getDiscordAvatar(playerId)
    if type(cfg.discord) ~= 'table' or type(cfg.discord.guild) ~= 'string' or cfg.discord.guild == '' then
        return nil
    end
    local discordIdentifier = GetPlayerIdentifierByType(playerId, 'discord')
    if type(discordIdentifier) ~= 'string' or discordIdentifier == '' then
        return nil
    end
    local discordId = discordIdentifier:gsub('discord:', '')
    if discordId == '' then
        return nil
    end
    local user = fetchDiscordMember(cfg.discord.guild, discordId)
    if not user then
        return nil
    end
    return buildDiscordAvatarUrl(user.avatar, discordId)
end

---@param playerId number
---@return string|nil
local function getSteamAvatar(playerId)
    local steamIdentifier = GetPlayerIdentifierByType(playerId, 'steam')
    if type(steamIdentifier) ~= 'string' or steamIdentifier == '' then
        return nil
    end
    local steamHex = steamIdentifier:gsub('steam:', '')
    local steamId64 = tonumber(steamHex, 16)
    if not steamId64 then
        return nil
    end
    local promiseHandle = promise.new()
    PerformHttpRequest(('https://steamcommunity.com/profiles/%s/?xml=1'):format(steamId64), function(_, content)
        if type(content) ~= 'string' or content == '' then
            promiseHandle:resolve(nil)
            return
        end
        for line in content:gmatch('[^\r\n]+') do
            if line:find('<avatarFull>') then
                local url = line:gsub('<avatarFull><!%[CDATA%[', ''):gsub(']]></avatarFull>', '')
                promiseHandle:resolve(url)
                return
            end
        end
        promiseHandle:resolve(nil)
    end, 'GET', '', {})
    local url = Citizen.Await(promiseHandle)
    if type(url) ~= 'string' or url == '' then
        return nil
    end
    return url
end

---@param playerId number
---@return string|nil
function Avatar.Get(playerId)
    if type(playerId) ~= 'number' or playerId <= 0 then
        return nil
    end
    local cached = getCachedAvatar(playerId)
    if cached and cached ~= '' then
        return cached
    end
    local avatar = nil
    if cfg.type == 'mugshot64' then
        avatar = getMugshotAvatar(playerId)
    elseif cfg.type == 'discord' then
        avatar = getDiscordAvatar(playerId)
    elseif cfg.type == 'steam' then
        avatar = getSteamAvatar(playerId)
    end
    if avatar and avatar ~= '' then
        setCachedAvatar(playerId, avatar)
        return avatar
    end
    return nil
end
