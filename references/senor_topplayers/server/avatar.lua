Avatar = {}

---@param playerId number
---@return string|nil
function Avatar.Get(playerId)
    if not playerId or type(playerId) ~= 'number' then return nil end
    return Avatar.GetAvatar(playerId)
end

local cfg = AvatarConfig

if cfg.type == 'mugshot' and GetResourceState(cfg.mugshot.resource) == 'started' then
    function Avatar.GetAvatar(playerId)
        local m = cfg.mugshot
        local raw = lib.callback.await(m.callback, playerId) or ''
        if type(raw) ~= 'string' or #raw == 0 then return nil end
        if raw:find('^data:') then return raw end
        return 'data:image/png;base64,' .. raw
    end

elseif cfg.type == 'discord' and cfg.discord.token ~= '' and cfg.discord.guild ~= '' then
    local discordUrl = 'https://discord.com/api/'
    local dc = cfg.discord

    local function request(guildId, discordId)
        local p = promise.new()
        local token = ('Bot %s'):format(dc.token)
        local endpoint = ('guilds/%s/members/%s'):format(guildId, discordId)
        PerformHttpRequest(discordUrl .. endpoint, function(code, data, _)
            if code == 200 and data then
                local decoded = json.decode(data)
                if decoded and decoded.user then
                    p:resolve(decoded.user)
                else
                    p:reject()
                end
            else
                p:reject()
            end
        end, 'GET', '', { ['Content-Type'] = 'application/json', ['Authorization'] = token })
        return Citizen.Await(p)
    end

    local function buildAvatarUrl(avatarHash, discordId)
        if not avatarHash or avatarHash == '' then
            return ('https://cdn.discordapp.com/embed/avatars/%s.png'):format(tonumber(discordId) % 5)
        end
        local ext = (avatarHash:sub(1, 1) == 'a' and avatarHash:sub(2, 2) == '_') and 'gif' or 'png'
        return ('https://cdn.discordapp.com/avatars/%s/%s.%s'):format(discordId, avatarHash, ext)
    end

    function Avatar.GetAvatar(playerId)
        local discord = GetPlayerIdentifierByType(playerId, 'discord')
        if not discord or discord == '' then return nil end
        discord = discord:gsub('discord:', '')
        if discord == '' then return nil end
        local ok, user = pcall(request, dc.guild, discord)
        if not ok or not user then return nil end
        return buildAvatarUrl(user.avatar, discord)
    end

elseif cfg.type == 'steam' then
    function Avatar.GetAvatar(playerId)
        local steam = GetPlayerIdentifierByType(playerId, 'steam')
        if not steam or steam == '' then return nil end
        local hex = steam:gsub('steam:', '')
        local steamID64 = tonumber(hex, 16)
        if not steamID64 then return nil end
        local p = promise.new()
        PerformHttpRequest(('https://steamcommunity.com/profiles/%s/?xml=1'):format(steamID64), function(_, content)
            if content then
                for line in content:gmatch('[^\r\n]+') do
                    if line:find('<avatarFull>') then
                        local url = line:gsub('<avatarFull><!%[CDATA%[', ''):gsub(']]></avatarFull>', '')
                        p:resolve(url)
                        return
                    end
                end
            end
            p:resolve(nil)
        end, 'GET', '', {})
        local url = Citizen.Await(p)
        if url and type(url) == 'string' and #url > 0 then return url end
        return nil
    end
end
