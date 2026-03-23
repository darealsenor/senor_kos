if not Config.Compatibility or not Config.Compatibility.enabled then
    return
end

local messageHooks = {}
local hookIdx = 1

RegisterServerEvent('chat:init')
AddEventHandler('chat:init', function()
    local playerId = source
    if not GetRegisteredCommands then return end
    
    local suggestions = {}
    for _, cmd in ipairs(GetRegisteredCommands()) do
        if IsPlayerAceAllowed(playerId, ('command.%s'):format(cmd.name)) then
            table.insert(suggestions, {
                name = '/' .. cmd.name,
                help = cmd.help or ''
            })
        end
    end
    
    if #suggestions > 0 then
        TriggerClientEvent('chat:addSuggestions', playerId, suggestions)
    end
end)

RegisterServerEvent('chat:addMessage')
AddEventHandler('chat:addMessage', function(msg)
    local src = source
    
    if type(msg) == 'string' then
        msg = { args = { msg } }
    end
    
    local txt = msg.args and msg.args[#msg.args] or msg.message or ''
    local sender = msg.args and #msg.args > 1 and msg.args[1] or GetPlayerName(src)
    local ch = chat:GetChannelByName("Global")
    
    if not ch then return end
    
    chat:LocalMessage(src, {
        message = txt,
        sender = sender,
        channel = ch,
        tags = {}
    })
end)

-- Handle _chat:messageEntered
RegisterServerEvent('_chat:messageEntered')
AddEventHandler('_chat:messageEntered', function(author, color, message, mode)
    local src = source
    
    if not message or not author then return end
    
    local msg = {
        color = color or { 255, 255, 255 },
        multiline = true,
        args = author ~= "" and { author, message } or { message },
        mode = mode
    }
    
    local canceled = false
    local routing = -1
    
    local hook = {
        updateMessage = function(t)
            for k, v in pairs(t) do
                if k == 'template' then
                    msg.template = v:gsub('%{%}', msg.template or '@default')
                elseif k == 'params' then
                    msg.params = msg.params or {}
                    for pk, pv in pairs(v) do
                        msg.params[pk] = pv
                    end
                else
                    msg[k] = v
                end
            end
        end,
        cancel = function() canceled = true end,
        setSeObject = function(obj) routing = getMatchingPlayers(obj) end,
        setRouting = function(tgt) routing = tgt end
    }
    
    for _, h in pairs(messageHooks) do
        if h.fn then h.fn(src, msg, hook) end
    end
    
    if canceled then return end
    
    TriggerEvent('chatMessage', src, #msg.args > 1 and msg.args[1] or '', msg.args[#msg.args])
    
    if WasEventCanceled() then return end
    
    local txt = msg.args[#msg.args] or message
    local sender = #msg.args > 1 and msg.args[1] or author
    local ch = chat:GetChannelByName("Global")
    
    if not ch then return end
    
    local data = {
        message = txt,
        sender = sender,
        channel = ch,
        tags = {}
    }
    
    if type(routing) == 'table' then
        for _, tgt in ipairs(routing) do
            chat:LocalMessage(tgt, data)
        end
    else
        chat:LocalMessage(routing == -1 and -1 or routing, data)
    end
end)

RegisterServerEvent('chat:removeSuggestion')
AddEventHandler('chat:removeSuggestion', function(name)
    if name then
        TriggerClientEvent('chat:removeSuggestion', source, name)
    end
end)

RegisterServerEvent('chat:clear')
AddEventHandler('chat:clear', function()
    TriggerClientEvent('chat:clear', source)
end)

RegisterServerEvent('__cfx_internal:commandFallback')
AddEventHandler('__cfx_internal:commandFallback', function(cmd)
    TriggerEvent('_chat:messageEntered', GetPlayerName(source), { 0, 0x99, 255 }, '/' .. cmd, nil)
    CancelEvent()
end)

RegisterNetEvent('playerJoining')
AddEventHandler('playerJoining', function()
    if GetConvarInt('chat_showJoins', 1) == 0 then return end
    
    local name = GetPlayerName(source)
    local ch = chat:GetChannelByName("Global")
    if ch then
        chat:LocalMessage(-1, {
            message = '^2* ' .. name .. ' ' .. locale('message_joined') .. '.',
            sender = '',
            channel = ch,
            tags = {}
        })
    end
end)

AddEventHandler('playerDropped', function(reason)
    if GetConvarInt('chat_showQuits', 1) == 0 then return end
    
    local name = GetPlayerName(source)
    local ch = chat:GetChannelByName("Global")
    if ch then
        chat:LocalMessage(-1, {
            message = '^2* ' .. name .. ' ' .. locale('message_left') .. ' (' .. (reason or locale('message_unknown')) .. ')',
            sender = '',
            channel = ch,
            tags = {}
        })
    end
end)

local function getMatchingPlayers(seObject)
    if type(seObject) ~= 'string' then
        return {}
    end
    
    local players = GetPlayers()
    local matches = {}
    
    for _, v in ipairs(players) do
        local pid = tonumber(v)
        if pid and IsPlayerAceAllowed(pid, seObject) then
            table.insert(matches, pid)
        end
    end
    
    return matches
end


exports('registerMessageHook', function(hook)
    local res = GetInvokingResource()
    messageHooks[hookIdx] = { fn = hook, resource = res }
    hookIdx = hookIdx + 1
    return hookIdx - 1
end)

AddEventHandler('onResourceStop', function(resName)
    for k, v in pairs(messageHooks) do
        if v.resource == resName then
            messageHooks[k] = nil
        end
    end
end)

-- Only register 'say' command if commands config is enabled (to avoid conflicts with qbox)
if Config.Commands then
    RegisterCommand('say', function(source, args, raw)
        local name = source == 0 and 'console' or GetPlayerName(source)
        TriggerEvent('_chat:messageEntered', name, { 255, 255, 255 }, raw:sub(5), nil)
    end, true)
end

AddEventHandler(('__cfx_export_chat_%s'):format('addMessage'), function(setCB)
    local resourceName = GetCurrentResourceName()
    local function addMessageWrapper(target, message)
        return exports[resourceName]:addMessage(target, message)
    end
    setCB(addMessageWrapper)
end)

AddEventHandler(('__cfx_export_chat_%s'):format('chatMessage'), function(setCB)
    local function chatMessageWrapper(target, author, message)
        if not message then
            -- If only two args provided, assume (author, message) for all players
            if target and author then
                message = author
                author = target
                target = -1
            else
                return false
            end
        end
        
        local targetId = target == -1 and -1 or (type(target) == 'number' and target or -1)
        local channel = chat:GetChannelByName("Global")
        
        if not channel then return false end
        
        chat:LocalMessage(targetId, {
            message = message,
            sender = author or 'SYSTEM',
            channel = channel,
            tags = {}
        })
        return true
    end
    setCB(chatMessageWrapper)
end)

