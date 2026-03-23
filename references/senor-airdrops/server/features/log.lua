local Log = {}

local DISCORD_URL = ''

local function validateDiscordURL()
    if not DISCORD_URL or DISCORD_URL == '' then
        warn('No Discord Webhook. set -> visit ^1senor-airdrops -> ^9 server -> ^1 features -> ^9 logs.lua')
        warn('^1and edit ^9DISCORD_URL ^1 with your discord ^9webhook.')
        return false
    end
    return true
end

validateDiscordURL()

function sendToDiscord(color, name, message, footer)
    local result = validateDiscordURL()
    if not result then
        print(([[
            ^1 NO DISCORD LOG WAS SET!:^9
            %s: ^1  %s
        ]]):format(name, message))
    end
    local embed = {
        {
            ["color"] = color,
            ["title"] = "**" .. name .. "**",
            ["description"] = message,
            ["footer"] = {
                ["text"] = footer,
            },
        }
    }
    PerformHttpRequest(DISCORD_URL, function(err, text, headers) end, 'POST',
        json.encode({ username = name, embeds = embed }), { ['Content-Type'] = 'application/json' })
end

function Log.new(playerId, instance, message, initiator, screenshot)
    local playerName = playerId == 0 and 'CONSOLE' or GetPlayerName(playerId) or 'Unknown'
    local initiatorName = initiator and (initiator == 0 and 'CONSOLE' or GetPlayerName(initiator)) or 'None'

    local coordsStr = ("%s, %s, %s"):format(instance.coords.x, instance.coords.y, instance.coords.z)
    local embedMessage = string.format(
        "**Airdrop Event**\n" ..
        "Player: `%s`\n" ..
        "Coords: `%s`\n" ..
        "Airdrop ID: `%s`\n" ..
        "LockTime: `%ss`\n" ..
        "Time Left: `%ss`\n" ..
        "Message: `%s`\n" ..
        "Initiator: `%s`",
        playerName,
        coordsStr,
        instance.id,
        instance.lockTime,
        instance.timeLeft or 0,
        message,
        initiatorName
    )

    local footerText = ("Airdrop System | %s"):format(os.date("%Y-%m-%d %H:%M:%S"))

    sendToDiscord(16753920, "Airdrop Log", embedMessage, footerText)
end

return Log
