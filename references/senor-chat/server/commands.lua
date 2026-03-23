local commandCooldowns = {}

local function getCommandConfig(cmdName)
    if not Config.Commands or not Config.Commands[cmdName] then
        return nil
    end
    return Config.Commands[cmdName]
end

local function isCommandEnabled(cmdName)
    local cmdConfig = getCommandConfig(cmdName)
    if not cmdConfig or not cmdConfig.enabled then
        return false
    end
    
    return true
end

local function checkCooldown(src, cmdName)
    local cmdConfig = getCommandConfig(cmdName)
    if not cmdConfig or not cmdConfig.timeout or cmdConfig.timeout <= 0 then
        return true
    end
    
    local now = os.time()
    if not commandCooldowns[src] then
        commandCooldowns[src] = {}
    end
    
    local lastUse = commandCooldowns[src][cmdName]
    if lastUse then
        local timeSince = now - lastUse
        if timeSince < cmdConfig.timeout then
            local remaining = cmdConfig.timeout - timeSince
            chat:LocalMessage(src, {
                message = locale('message_cooldown_wait', remaining),
                channel = { id = 0 }
            })
            return false
        end
    end
    
    commandCooldowns[src][cmdName] = now
    return true
end

local function formatCommandMessage(src, message, cmdName)
    local attrs = chat:GetPlayerAttributes(src)
    if not attrs then return message end
    
    local playerName = attrs.sender or 'Unknown'
    
    if cmdName == 'me' then
        return ('* %s (( %s ))'):format(playerName, message)
    elseif cmdName == 'do' then
        return ('* %s (( %s ))'):format(message, playerName)
    elseif cmdName == 'ooc' then
        return ('[OOC] %s: %s'):format(playerName, message)
    elseif cmdName == 'looc' then
        return ('[Local OOC] %s: %s'):format(playerName, message)
    elseif cmdName == 'twt' then
        return ('[Twitter] @%s: %s'):format(playerName, message)
    elseif cmdName == 'ad' then
        return ('[Advertisement] %s: %s'):format(playerName, message)
    end
    
    return message
end

local function sendCommandMessage(src, message, cmdName, channelId, range)
    if not isCommandEnabled(cmdName) then
        chat:LocalMessage(src, {
            message = locale('message_error_command_disabled'),
            channel = { id = 0 }
        })
        return
    end
    
    if not checkCooldown(src, cmdName) then
        return
    end
    
    local cmdConfig = getCommandConfig(cmdName)
    local attrs = chat:GetPlayerAttributes(src)
    if not attrs then return end
    
    local tagText = cmdConfig and locale(cmdConfig.localeKey) or cmdName:upper()
    local tag = {
        bgColor = 'rgba(34, 139, 230, 0.1)',
        color = '#228be6',
        text = tagText
    }
    
    local formattedMessage = formatCommandMessage(src, message, cmdName)
    
    local msgData = {
        message = formattedMessage,
        channel = { id = channelId },
        tags = { tag }
    }
    
    local channelName = chat:GetChannelNameById(channelId)
    if not channelName then return end
    
    msgData.channel.name = channelName
    
    if range then
        chat:Message(src, msgData)
        
        msgData.senderId = src
        msgData.proximityRange = range
        TriggerClientEvent('senor-chat:client:sendProximityMessage', -1, msgData)
    else
        chat:Message(src, msgData)
    end
end

lib.addCommand('ooc', {
    help = locale('command_help_ooc'),
    params = {
        { name = 'message', type = 'longString', help = locale('command_help_ooc') }
    }
}, function(source, args, raw)
    if not args.message or args.message == '' then return end
    sendCommandMessage(source, args.message, 'ooc', 0)
end)

lib.addCommand('looc', {
    help = locale('command_help_looc'),
    params = {
        { name = 'message', type = 'longString', help = locale('command_help_looc') }
    }
}, function(source, args, raw)
    if not args.message or args.message == '' then return end
    sendCommandMessage(source, args.message, 'looc', 0, 20.0)
end)

lib.addCommand('me', {
    help = locale('command_help_me'),
    params = {
        { name = 'message', type = 'longString', help = locale('command_help_me') }
    }
}, function(source, args, raw)
    if not args.message or args.message == '' then return end
    sendCommandMessage(source, args.message, 'me', 0, 20.0)
end)

lib.addCommand('do', {
    help = locale('command_help_do'),
    params = {
        { name = 'message', type = 'longString', help = locale('command_help_do') }
    }
}, function(source, args, raw)
    if not args.message or args.message == '' then return end
    sendCommandMessage(source, args.message, 'do', 0, 20.0)
end)

lib.addCommand('twt', {
    help = locale('command_help_twt'),
    params = {
        { name = 'message', type = 'longString', help = locale('command_help_twt') }
    }
}, function(source, args, raw)
    if not args.message or args.message == '' then return end
    sendCommandMessage(source, args.message, 'twt', 0)
end)

lib.addCommand('ad', {
    help = locale('command_help_ad'),
    params = {
        { name = 'message', type = 'longString', help = locale('command_help_ad') }
    }
}, function(source, args, raw)
    if not args.message or args.message == '' then return end
    sendCommandMessage(source, args.message, 'ad', 0)
end)

lib.addCommand('clearchat', {
    help = locale('command_help_clearchat')
}, function(source)
    TriggerClientEvent('senor-chat:client:clearChat', source)
end)

lib.addCommand('clearchannel', {
    help = locale('command_help_clearchannel')
}, function(source)
    local channelId = lib.callback.await('senor-chat:client:GetCurrentChannel', source)
    lib.print.info(channelId)
    if not channelId then
        return
    end
    
    local channelName = channelId and chat:GetChannelNameById(channelId) or nil
    if not channelName then
        chat:LocalMessage(source, {
            message = locale('message_error_no_channel'),
            channel = { id = 0 }
        })
        return
    end
    
    if not HasPermission(source, Permissions.DELETE_MESSAGE) then
        chat:LocalMessage(source, {
            message = locale('message_permission_delete'),
            channel = { id = 0 }
        })
        return
    end
    
    chat:ClearChannel(channelName, source)
end)

