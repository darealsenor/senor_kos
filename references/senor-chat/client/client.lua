IsNuiLoaded = false
PlayerPermissions = nil

RegisterNetEvent('__cfx_internal:serverPrint')
RegisterNetEvent('_chat:messageEntered')

local function addMessage(data)
    if not data.channel then return end
    
    local ch = data.channel.id or data.channel.name or data.channel
    if not ValidateChannel(ch) then return end
    SendReactMessage('newMessage', data)
end

RegisterNetEvent('senor-chat:client:newMessage')
AddEventHandler('senor-chat:client:newMessage', addMessage)

local function loadPerms()
    if PlayerPermissions then return end
    PlayerPermissions = lib.callback.await('senor-chat:server:GetPlayerPermissions', false)
    SendReactMessage('playerPermissions', PlayerPermissions)
end

local function toggleChat()
    if not IsNuiLoaded then return end
    ToggleNuiFrame(true, true, true)
end

RegisterNetEvent('senor-chat:playerLoaded')
AddEventHandler('senor-chat:playerLoaded', function()
    loadPerms()
end)

RegisterNetEvent('senor-chat:client:playerPermissions')
AddEventHandler('senor-chat:client:playerPermissions', function(permissions)
    PlayerPermissions = permissions
    SendReactMessage('playerPermissions', permissions)
end)

CreateThread(function()
    Wait(1000)
    loadPerms()
end)

ChatKeybind = lib.addKeybind({
    name = 'senor_chat',
    description = 'toggle chat',
    defaultKey = 'T',
    onPressed = function(self)
        toggleChat()
    end,
})

CreateThread(function()
    ChatKeybind:disable(true)
    SetTextChatEnabled(false)
end)


RegisterNetEvent('senor-chat:client:deleteMessage')
AddEventHandler('senor-chat:client:deleteMessage', function(data)
    if not ValidateChannel(data.channel) then return end
    SendReactMessage("DeleteMessageById", data.id)
end)

RegisterNetEvent('senor-chat:client:clearChannel')
AddEventHandler('senor-chat:client:clearChannel', function(data)
    if not data or not data.channel then return end
    SendReactMessage("clearChannel", data.channel)
end)