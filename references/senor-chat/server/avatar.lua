local profilePictureCache = {}
local discordAvatarConfigWarned = false

local function isEmpty(s)
    if s == nil then return true end
    if type(s) == 'string' and (s == '' or s == 'null') then return true end
    return false
end

local function getCacheKey(playerId)
    if not Config.Avatar then
        return 'player_' .. playerId
    end
    
    if Config.Avatar.Type == "Discord" then
        local discord = GetPlayerIdentifierByType(playerId, 'discord')
        if discord and discord ~= '' then
            return discord
        end
    elseif Config.Avatar.Type == "Steam" then
        local steam = GetPlayerIdentifierByType(playerId, 'steam')
        if steam and steam ~= '' then
            return steam
        end
    end
    return 'player_' .. playerId
end

local function getAvatar(avatar, discordId)
    local imgURL
    if (avatar:sub(1, 1) and avatar:sub(2, 2) == "_") then
        imgURL = "https://cdn.discordapp.com/avatars/" .. discordId .. "/" .. avatar .. ".gif"
    else
        imgURL = "https://cdn.discordapp.com/avatars/" .. discordId .. "/" .. avatar .. ".png"
    end

    return imgURL
end

function GetProfilePicture(playerId)
    if not Config.Avatar then
        return 'https://avatars.githubusercontent.com/u/71390173?v=4'
    end
    
    local cacheKey = getCacheKey(playerId)
    
    if profilePictureCache[cacheKey] then
        return profilePictureCache[cacheKey]
    end

    local profilePicture = Config.Avatar.FallbackImage or 'https://avatars.githubusercontent.com/u/71390173?v=4'

    if Config.Avatar.Type == "Discord" then
        if isEmpty(ServerConfig.Avatar.DiscordToken) or isEmpty(ServerConfig.Avatar.DiscordGuild) then
            if not discordAvatarConfigWarned then
                discordAvatarConfigWarned = true
                lib.print.info('Avatar Type is set to Discord but DiscordToken or DiscordGuild is empty. Set them in config/discord_config.lua for Discord avatars to work.')
            end
            profilePicture = Config.Avatar.FallbackImage
        else
            local member = GetGuildMemberData(playerId)
            if member and member.user then
                local user = member.user
                local discordId = (GetPlayerIdentifierByType(playerId, 'discord') or ''):gsub('discord:', '')
                local avatarHash = user.avatar
                if not isEmpty(avatarHash) and discordId ~= '' then
                    profilePicture = getAvatar(avatarHash, discordId)
                end
            end
        end
    elseif Config.Avatar.Type == "Steam" then
        local steam = GetPlayerIdentifierByType(playerId, 'steam')

        if isEmpty(steam) then
            profilePicture = Config.Avatar.FallbackImage
        else
            local hex = string.sub(steam, string.len("steam:") + 1)
            local steamID64 = tonumber(hex, 16)

            if not steamID64 then
                profilePicture = Config.Avatar.FallbackImage
            else
                local p = promise.new()
                PerformHttpRequest('http://steamcommunity.com/profiles/' .. steamID64 .. '/?xml=1', function(error, content, head)
                    if content then
                        for line in content:gmatch("[^\r\n]+") do
                            if line:find("<avatarFull>") then
                                p:resolve(line:gsub("<avatarFull><!%[CDATA%[", ""):gsub("]]></avatarFull>", ""))
                                return
                            end
                        end
                    end
                    p:resolve(Config.Avatar.FallbackImage)
                end)
                profilePicture = Citizen.Await(p)
            end
        end
    end

    profilePictureCache[cacheKey] = profilePicture
    return profilePicture
end

