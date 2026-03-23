local discordUrl = "https://discord.com/api/"

local profilePictureCache = {}

local function request(method, endpoint, jsondata, reason)
    local p = promise.new()

    local token = ('Bot %s'):format(ServerConfig.Tokens.DiscordToken)

    PerformHttpRequest(("%s%s"):format(discordUrl, endpoint), function(errorCode, resultData, resultHeaders)
            if errorCode == 200 then
                p:resolve({ data = json.decode(resultData), code = errorCode, headers = resultHeaders })
            else
                p:reject("HTTP Request failed with error code: " .. errorCode)
            end
        end, method, #jsondata > 0 and jsondata or "",
        { ["Content-Type"] = "application/json", ["Authorization"] = token, ['X-Audit-Log-Reason'] = reason })
    return Citizen.Await(p)
end

local function getAvatar(avatar, discordId)
    local imgURL
    if (avatar:sub(1, 1) and avatar:sub(2, 2) == "_") then
        imgURL = "https://cdn.discordapp.com/avatars/" .. discordId .. "/" .. avatar .. ".gif";
    else
        imgURL = "https://cdn.discordapp.com/avatars/" .. discordId .. "/" .. avatar .. ".png"
    end

    return imgURL
end

local function isEmpty(s)
    return not s or string.len(s) == 0
end

local function getCacheKey(playerId)
    if ServerConfig.ProfileOptions.DefaultPicture == ServerConfig.ProfileOptions.Types.Discord then
        local discord = GetPlayerIdentifierByType(playerId, 'discord')
        if discord and discord ~= '' then
            return discord
        end
    elseif ServerConfig.ProfileOptions.DefaultPicture == ServerConfig.ProfileOptions.Types.Steam then
        local steam = GetPlayerIdentifierByType(playerId, 'steam')
        if steam and steam ~= '' then
            return steam
        end
    end
    return 'player_' .. playerId
end

function GetProfilePicture(playerId)
    local cacheKey = getCacheKey(playerId)
    
    if profilePictureCache[cacheKey] then
        return profilePictureCache[cacheKey]
    end

    local profilePicture = Shared.FallbackImage

    if ServerConfig.ProfileOptions.DefaultPicture == ServerConfig.ProfileOptions.Types.Discord then
        if isEmpty(ServerConfig.Tokens.DiscordToken) or isEmpty(ServerConfig.Tokens.DiscordGuild) then
            profilePicture = Shared.FallbackImage
        else
            local discord = GetPlayerIdentifierByType(playerId, 'discord'):gsub('discord:', '')
            if isEmpty(discord) then
                profilePicture = Shared.FallbackImage
            else
                local success, result = pcall(request, 'GET', ("guilds/%s/members/%s"):format(ServerConfig.Tokens.DiscordGuild, discord), {}, 'squads')

                if success and result and result.data and result.data.user then
                    local avatar = result.data.user?.avatar
                    if isEmpty(avatar) then
                        profilePicture = "https://cdn.discordapp.com/embed/avatars/" .. (tonumber(discord) % 5) .. ".png"
                    else
                        profilePicture = getAvatar(avatar, discord)
                    end
                else
                    profilePicture = Shared.FallbackImage
                end
            end
        end
    elseif ServerConfig.ProfileOptions.DefaultPicture == ServerConfig.ProfileOptions.Types.Steam then
        local steam = GetPlayerIdentifierByType(playerId, 'steam')
        print(steam)

        if isEmpty(steam) then
            profilePicture = Shared.FallbackImage
        else
            local hex = string.sub(steam, string.len("steam:") + 1)
            local steamID64 = tonumber(hex, 16)

            print('http://steamcommunity.com/profiles/' .. steamID64 .. '/?xml=1')

            if not steamID64 then
                profilePicture = Shared.FallbackImage
            else
                local p = promise:new()
                PerformHttpRequest('http://steamcommunity.com/profiles/' .. steamID64 .. '/?xml=1', function(error, content, head)
                    if content then
                        for line in content:gmatch("[^\r\n]+") do
                            if line:find("<avatarFull>") then
                                p:resolve(line:gsub("<avatarFull><!%[CDATA%[", ""):gsub("]]></avatarFull>", ""))
                                return
                            end
                        end
                    end
                    p:resolve(Shared.FallbackImage)
                end)
                profilePicture = Citizen.Await(p)
            end
        end
    end

    profilePictureCache[cacheKey] = profilePicture
    return profilePicture
end
