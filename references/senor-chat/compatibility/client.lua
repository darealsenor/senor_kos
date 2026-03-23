--[[
    FIVEM DEFAULT CHAT COMPATIBILITY - CLIENT
    Provides compatibility with the original FiveM chat system
]]

if not Config.Compatibility or not Config.Compatibility.enabled then
    return
end

RegisterNetEvent('chatMessage')
AddEventHandler('chatMessage', function(author, color, text)
    if not text then return end
    
    SendReactMessage('newMessage', {
        id = math.random(1000000, 9999999),
        message = text,
        sender = author or 'SYSTEM',
        senderId = 0,
        channel = { id = 0 },
        tags = {},
        picture = Config.Avatar.FallbackImage,
        color = nil
    })
end)

RegisterNetEvent('chat:addMessage')
AddEventHandler('chat:addMessage', function(msg)
    if type(msg) == 'string' then
        msg = { args = { msg } }
    end
    
    SendReactMessage('newMessage', {
        id = math.random(1000000, 9999999),
        message = msg.args and msg.args[#msg.args] or msg.message or '',
        sender = msg.args and #msg.args > 1 and msg.args[1] or 'SYSTEM',
        senderId = 0,
        channel = { id = 0 },
        tags = {},
        picture = Config.Avatar.FallbackImage,
        color = nil
    })
end)

if Config.Compatibility.consolePrints then
    AddEventHandler('__cfx_internal:serverPrint', function(msg)
        if not msg then return end
        
        SendReactMessage('newMessage', {
            id = math.random(1000000, 9999999),
            message = msg,
            sender = 'CONSOLE',
            senderId = 0,
            channel = { id = 0 },
            tags = {},
            picture = Config.Avatar.FallbackImage,
            color = nil
        })
    end)
end

RegisterNetEvent('chat:removeSuggestion')
AddEventHandler('chat:removeSuggestion', function(name)
    if name then
        SendReactMessage('removeSuggestion', name)
    end
end)

RegisterNetEvent('chat:clear')
AddEventHandler('chat:clear', function()
    SendReactMessage('clearChat', nil)
end)

local function addMessage(msg)
    if type(msg) == 'string' then
        msg = { args = { msg } }
    end
    
    SendReactMessage('newMessage', {
        id = math.random(1000000, 9999999),
        message = msg.args and msg.args[#msg.args] or msg.message or '',
        sender = msg.args and #msg.args > 1 and msg.args[1] or 'SYSTEM',
        senderId = 0,
        channel = { id = 0 },
        tags = {},
        picture = Config.Avatar.FallbackImage,
        color = nil
    })
end

exports('addMessage', addMessage)


AddEventHandler(('__cfx_export_chat_%s'):format('addMessage'), function(setCB)
    setCB(addMessage)
end)

AddEventHandler(('__cfx_export_chat_%s'):format('addSuggestion'), function(setCB)
    local resourceName = GetCurrentResourceName()
    local function addSuggestionWrapper(name, help, params)
        return exports[resourceName]:addSuggestion(name, help, params)
    end
    setCB(addSuggestionWrapper)
end)