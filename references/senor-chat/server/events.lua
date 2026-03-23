RegisterNetEvent('senor-chat:server:newMessage')
AddEventHandler('senor-chat:server:newMessage', function(data)
    local src = source
    
    if not data or not data.channel then
        return
    end
    
    local channelId = data.channel.id
    if not channelId then
        return
    end
    
    if IsLockdownEnabled() then
        local adminBypass = true
        if Config.General and Config.General.adminBypassLockdown ~= nil then
            adminBypass = Config.General.adminBypassLockdown
        end
        
        if (not adminBypass) or (not HasPermission(src, Permissions.ADMIN)) then
            chat:LocalMessage(src, {
                message = locale('message_error_lockdown'),
                channel = { id = 0 }
            })
            return
        end
    end
    
    local channelName = chat:GetChannelNameById(channelId)
    if not channelName then
        return
    end
    
    if data.channel.gang and not chat:IsInGang(src, channelName) then
        return
    end

    local ch = chat:GetChannelById(channelId)
    if ch and ch.permission and not HasPermission(src, ch.permission) then
        chat:LocalMessage(src, {
            message = locale('message_permission_channel_access'),
            channel = { id = 0 }
        })
        return
    end
    
    data.channel.name = channelName
    chat:Message(src, data)
end)

RegisterNetEvent('senor-chat:server:deleteMessage')
AddEventHandler('senor-chat:server:deleteMessage', function(data)
    local src = source
    if not HasPermission(src, Permissions.DELETE_MESSAGE) then
        chat:LocalMessage(src, {
            message = locale('message_permission_delete'),
            channel = { id = 0 }
        })
        return
    end
    
    local channelName = data.channel.id and chat:GetChannelNameById(data.channel.id) or data.channel.name
    if not channelName then
        return
    end
    
    chat:deleteMessage(data.id, channelName, src)
end)

RegisterNetEvent('senor-chat:server:muteUser')
AddEventHandler('senor-chat:server:muteUser', function(data)
    local src = source
    if not HasPermission(src, Permissions.MUTE_PLAYER) then
        chat:LocalMessage(src, {
            message = locale('message_permission_mute'),
            channel = { id = 0 }
        })
        return
    end
    
    if not data.targetId or not data.durationMinutes then return end
    chat:MuteUser(data.targetId, data.durationMinutes, src, data.reason, true, { id = 0, name = 'Global' })
end)

RegisterNetEvent('senor-chat:server:unmuteUser')
AddEventHandler('senor-chat:server:unmuteUser', function(data)
    local src = source
    if not HasPermission(src, Permissions.UNMUTE_PLAYER) then
        chat:LocalMessage(src, {
            message = locale('message_permission_unmute'),
            channel = { id = 0 }
        })
        return
    end
    
    if not data.targetId then return end
    
    if chat:UnmuteUser(data.targetId, src) then
        chat:LocalMessage(data.targetId, {
            message = locale('message_unmuted_by', GetPlayerName(src), src),
            channel = { id = 0 }
        })
        local staff = chat:GetChannelByName("Staff")
        if staff then
            chat:StaffMessage({
                message = locale('message_staff_unmuted', GetPlayerName(src), src, GetPlayerName(data.targetId), data.targetId),
                channel = staff
            })
        end
    end
end)


local function openMuteModal(src, action, targetId)
    if action == 'mute' and not HasPermission(src, Permissions.MUTE_PLAYER) then
        chat:LocalMessage(src, {
            message = locale('message_permission_mute'),
            channel = { id = 0 }
        })
        return
    end
    
    if action == 'unmute' and not HasPermission(src, Permissions.UNMUTE_PLAYER) then
        chat:LocalMessage(src, {
            message = locale('message_permission_unmute'),
            channel = { id = 0 }
        })
        return
    end
    
    TriggerClientEvent('senor-chat:client:openMuteModal', src, {
        action = action,
        targetId = targetId
    })
end

lib.addCommand('timeout', {
    help = locale('command_help_mute'),
    restricted = 'qbcore.admin'
}, function(src, args)
    openMuteModal(src, 'mute', args.target and tonumber(args.target))
end)

lib.addCommand('mute', {
    help = locale('command_help_mute'),
    restricted = 'qbcore.admin'
}, function(src, args)
    openMuteModal(src, 'mute', args.target and tonumber(args.target))
end)

lib.addCommand('unmute', {
    help = locale('command_help_unmute'),
    restricted = 'qbcore.admin'
}, function(src, args)
    openMuteModal(src, 'unmute', args.target and tonumber(args.target))
end)

lib.addCommand('untimeout', {
    help = locale('command_help_unmute'),
    params = {
        {
            name = 'target',
            type = 'playerId',
            help = locale('command_help_target'),
        },
    },
    restricted = 'qbcore.admin'
}, function(src, args)
    openMuteModal(src, 'unmute', args.target)
end)

RegisterNetEvent('senor-chat:server:clearChannel')
AddEventHandler('senor-chat:server:clearChannel', function(channelId)
    local src = source
    if not HasPermission(src, Permissions.DELETE_MESSAGE) then
        chat:LocalMessage(src, {
            message = locale('message_permission_delete'),
            channel = { id = 0 }
        })
        return
    end
    
    local channelName = channelId and chat:GetChannelNameById(channelId) or nil
    if not channelName then
        chat:LocalMessage(src, {
            message = locale('message_error_no_channel'),
            channel = { id = 0 }
        })
        return
    end
    
    chat:ClearChannel(channelName, src)
end)

AddEventHandler('senor-chat:playerDropped', function(playerId)
    chat:RemovePlayer(playerId)
end)