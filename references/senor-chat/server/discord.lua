local roleCache = {}
local roleCacheTime = {}
local memberCache = {}
local discordConfigWarned = false

local function request(method, endpoint, jsondata, reason)
    local p = promise.new()

    local token = ('Bot %s'):format(ServerConfig.Avatar.DiscordToken)

    PerformHttpRequest(("%s%s"):format("https://discord.com/api/", endpoint), function(errorCode, resultData, resultHeaders)
            if errorCode == 200 then
                p:resolve({ data = json.decode(resultData), code = errorCode, headers = resultHeaders })
            else
                p:reject("HTTP Request failed with error code: " .. errorCode)
            end
        end, method, #jsondata > 0 and jsondata or "",
        { ["Content-Type"] = "application/json", ["Authorization"] = token, ['X-Audit-Log-Reason'] = reason })
    return Citizen.Await(p)
end

function GetDiscordRoles(playerId)
    if not ServerConfig.Avatar.DiscordToken or not ServerConfig.Avatar.DiscordGuild then
        return {}
    end

    local discordId = GetPlayerIdentifierByType(playerId, 'discord')
    if not discordId or discordId == '' then
        return {}
    end

    discordId = discordId:gsub('discord:', '')

    local cacheKey = discordId .. '_' .. ServerConfig.Avatar.DiscordGuild
    local now = os.time()

    if roleCache[cacheKey] and roleCacheTime[cacheKey] and (now - roleCacheTime[cacheKey]) < 60 then
        return roleCache[cacheKey]
    end

    local endpoint = ("guilds/%s/members/%s"):format(ServerConfig.Avatar.DiscordGuild, discordId)
    local success, result = pcall(request, 'GET', endpoint, {}, 'senor_chat')

    if success and result and result.code == 200 and result.data and result.data.roles then
        local roles = result.data.roles
        
        roleCache[cacheKey] = roles
        roleCacheTime[cacheKey] = now
        
        return roles
    end

    return {}
end

function GetGuildMemberData(playerId)
    if not ServerConfig.Avatar or not ServerConfig.Avatar.DiscordToken or ServerConfig.Avatar.DiscordToken == '' or not ServerConfig.Avatar.DiscordGuild or ServerConfig.Avatar.DiscordGuild == '' then
        if not discordConfigWarned then
            discordConfigWarned = true
            lib.print.info('Discord token or guild is not set. Set DiscordToken and DiscordGuild in config/discord_config.lua for Discord avatars and Discord display names to work.')
        end
        return nil
    end
    local rawDiscord = GetPlayerIdentifierByType(playerId, 'discord')
    if not rawDiscord or rawDiscord == '' then return nil end
    local discordId = rawDiscord:gsub('discord:', '')
    if memberCache[rawDiscord] then
        return memberCache[rawDiscord]
    end
    local endpoint = ("guilds/%s/members/%s"):format(ServerConfig.Avatar.DiscordGuild, discordId)
    local success, result = pcall(request, 'GET', endpoint, {}, 'senor_chat')
    if success and result and result.data and result.data.user then
        memberCache[rawDiscord] = result.data
        return result.data
    end
    return nil
end

function GetDiscordDisplayName(playerId)
    local member = GetGuildMemberData(playerId)
    if not member or not member.user then return nil end
    local user = member.user
    local name = (user.global_name and user.global_name ~= '' and user.global_name) or (user.username and user.username ~= '' and user.username)
    return name or nil
end

