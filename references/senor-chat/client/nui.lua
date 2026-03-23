local function isCommandRegistered(cmdName)
    if not cmdName then
        return false
    end
    
    if Config.Commands and Config.Commands[cmdName] then
        return true
    end
    
    if not GetRegisteredCommands then
        return false
    end
    
    local commands = GetRegisteredCommands()
    for _, cmd in ipairs(commands) do
        if cmd.name == cmdName then
            return true
        end
    end
    
    return false
end

local function extractCommandName(message)
    local cmdName = message:match("^[/%.]([^ ]+)")
    if not cmdName then
        cmdName = message:match("^([^ ]+)")
    end
    return cmdName
end

RegisterNuiCallback('sendMessage', function(data, cb)
    local msg = data.message
    
    if msg:sub(1, 1) == '/' then
        local cmdName = extractCommandName(msg)
        
        if cmdName and Config.Commands and Config.Commands[cmdName] then
            ExecuteCommand(msg:gsub('/', ''))
            cb(1)
            return
        end
        
        ExecuteCommand(msg:gsub('/', ''))
        cb(1)
        return
    end

    if msg:sub(1, 1) == '.' then
        local cmdName = extractCommandName(msg)
        
        if cmdName and Config.Commands and Config.Commands[cmdName] then
            ExecuteCommand(msg:gsub('^%.', ''))
            cb(1)
            return
        end
        
        ExecuteCommand(msg:gsub('^%.', ''))
        cb(1)
        return
    end

    if IsTextACommand(msg) then
        local cmdName = extractCommandName(msg)
        
        if cmdName and Config.Commands and Config.Commands[cmdName] then
            ExecuteCommand(msg)
            cb(1)
            return
        end
        
        ExecuteCommand(msg)
        cb(1)
        return
    end

    if Config.General and Config.General.blockNonCommandMessages then
        local cmdName = extractCommandName(msg) or msg:match("^([^ ]+)") or msg
        TriggerEvent('senor-chat:client:newMessage', {
            message = locale('message_error_invalid_command', cmdName),
            channel = { id = 0 },
            sender = 'System',
            senderId = 0
        })
        cb(1)
        return
    end

    TriggerServerEvent('senor-chat:server:newMessage', data)
    cb(1)
end)

RegisterNUICallback('hideFrame', function(_, cb)
    CreateThread(function()
        Wait(50)
        SetNuiFocus(false, false)
    end)
    cb({})
end)

RegisterNUICallback('hideInput', function(_, cb)
    SetNuiFocus(false, false)
    cb({})
end)

local function SendLocaleData()
    local localeData = GetLocaleData()
    SendReactMessage('setLocale', localeData)
end

RegisterNUICallback('nuiLoaded', function(_, cb)
    IsNuiLoaded = true
    ChatKeybind:disable(false)
    
    SendLocaleData()
    
    local data = lib.callback.await('senor-chat:server:GetChatData', false)
    local id = cache.serverId
    
    local ui = {}
    if Config.UI?.ColorPalette then
        ui.ColorPalette = Config.UI.ColorPalette
    end
    
    local presets
    if Config.Presets?.enabled then
        presets = {
            enabled = Config.Presets.enabled,
            default = Config.Presets.default,
            presets = Config.Presets.presets
        }
    end
    
    local mute
    if Config.Mute then
        local reasons = {}
        if Config.Mute.reasons then
            for _, reason in ipairs(Config.Mute.reasons) do
                if type(reason) == "table" then
                    table.insert(reasons, {
                        value = reason.value,
                        localeKey = reason.localeKey
                    })
                else
                    table.insert(reasons, {
                        value = reason,
                        localeKey = nil
                    })
                end
            end
        end
        mute = {
            minTimeMinutes = Config.Mute.minTimeMinutes or 1,
            maxTimeMinutes = Config.Mute.maxTimeMinutes or 1440,
            reasons = reasons
        }
    end
    
    cb({
        id = id,
        tags = data.tags or {},
        colors = data.colors or {},
        selectedTag = data.selectedTag,
        selectedColor = data.selectedColor,
        uiConfig = ui,
        presets = presets,
        muteConfig = mute
    })
    
    CreateThread(function()
        Wait(0)
        SendReactMessage('clearChat')
    end)
end)

RegisterNuiCallback('deleteMessageById', function(data, cb)
    TriggerServerEvent('senor-chat:server:deleteMessage', data)
    cb(1)
end)

RegisterNuiCallback('setSelectedTag', function(data)
    if not data then
        TriggerServerEvent('senor-chat:server:updateSelectedTag', nil)
        return
    end
    
    local ids = {}
    if type(data) == 'table' and #data > 0 then
        for _, tag in ipairs(data) do
            if tag.id then
                table.insert(ids, tag.id)
            end
        end
    elseif data.id then
        ids = {data.id}
    end
    
    TriggerServerEvent('senor-chat:server:updateSelectedTag', #ids > 0 and ids or nil)
end)

RegisterNuiCallback('setSelectedColor', function(data)
    TriggerServerEvent('senor-chat:server:updateSelectedColor', data and data.id or nil)
end)

RegisterNetEvent('senor-chat:client:metaUpdate')
AddEventHandler('senor-chat:client:metaUpdate', function(data)
    SendReactMessage('updateMeta', data)
end)

RegisterNetEvent('senor-chat:client:openMuteModal')
AddEventHandler('senor-chat:client:openMuteModal', function(data)
    CreateThread(function()
        Wait(0)
        SetNuiFocus(true, true)
        SendReactMessage('openMuteModal', data)
    end)
end)

RegisterNUICallback('muteUser', function(data, cb)
    if not data.targetId or not data.durationMinutes then
        cb({ success = false })
        return
    end
    
    TriggerServerEvent('senor-chat:server:muteUser', {
        targetId = data.targetId,
        durationMinutes = data.durationMinutes,
        reason = data.reason or ''
    })
    cb({ success = true })
end)

RegisterNUICallback('unmuteUser', function(data, cb)
    if not data.targetId then
        cb({ success = false })
        return
    end
    
    TriggerServerEvent('senor-chat:server:unmuteUser', { targetId = data.targetId })
    cb({ success = true })
end)

RegisterNUICallback('getMuteStatus', function(data, cb)
    if not data.targetId then
        cb({})
        return
    end
    
    local status = lib.callback.await('senor-chat:server:GetMuteStatus', false, data.targetId)
    cb(status or {})
end)

RegisterNetEvent('senor-chat:playerLoaded')
AddEventHandler('senor-chat:playerLoaded', function()
    if IsNuiLoaded and ChatKeybind then
        ChatKeybind:disable(false)
    end
end)

RegisterNetEvent('senor-chat:playerUnloaded')
AddEventHandler('senor-chat:playerUnloaded', function()
    SetNuiFocus(false, false)
    SendReactMessage('setVisible', { box = false, input = false })
    SendReactMessage('clearChat')
    if ChatKeybind then
        ChatKeybind:disable(true)
    end
end)

