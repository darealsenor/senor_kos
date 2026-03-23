Logger = {}

local function discordLog(title, message, color)
    if #Config.discordWebhook < 10 then
        return
    end
    CreateThread(function()
        PerformHttpRequest(Config.discordWebhook, function(err, text, headers) end, 'POST', json.encode({
            embeds = { {
                title = title,
                description = message,
                color = color or 16711680,
                footer = { text = 'senor_redzones' },
            } }
        }), { ['Content-Type'] = 'application/json' })
    end)
end

---@param source number|string
---@param event string
---@param message string
---@param ... string
function Logger.log(source, event, message, ...)
    if Config.loggingEnabled then
        lib.logger(source, event, message, ...)
    end
end

---@param source number
---@param event string
---@param message string
---@param discordTitle? string
function Logger.logZoneAction(source, event, message, discordTitle)
    Logger.log(source, event, message)
    if discordTitle then
        discordLog(discordTitle, message, 16711680)
    end
end
