lib.addCommand('fakemsg', {
    help = 'Debug: Send fake messages',
    params = {
        { name = 'amount', type = 'number', help = 'Number of messages to send' },
        { name = 'channel', type = 'string', help = 'Channel name (optional)', optional = true }
    }
}, function(source, args)
    local amount = tonumber(args.amount)
    if not amount or amount < 1 or amount > 100 then
        chat:LocalMessage(source, {
            message = 'Invalid amount. Must be between 1 and 100',
            channel = { id = 0 }
        })
        return
    end
    
    local channelName = args.channel
    local channelId = nil
    
    if channelName then
        local channel = chat:GetChannelByName(channelName)
        if not channel then
            chat:LocalMessage(source, {
                message = 'Channel not found: ' .. channelName,
                channel = { id = 0 }
            })
            return
        end
        channelId = channel.id
    else
        channelId = lib.callback.await('senor-chat:client:GetCurrentChannel', source)
        if not channelId then
            chat:LocalMessage(source, {
                message = 'Could not get current channel',
                channel = { id = 0 }
            })
            return
        end
        local channel = chat:GetChannelById(channelId)
        if channel then
            channelName = channel.name
        else
            chat:LocalMessage(source, {
                message = 'Channel not found for ID: ' .. tostring(channelId),
                channel = { id = 0 }
            })
            return
        end
    end
    
    CreateThread(function()
        for i = 1, amount do
            local msgData = {
                message = string.format('Fake message %d/%d', i, amount),
                channel = { id = channelId, name = channelName },
                tags = {},
                skipTimeout = true
            }
            chat:Message(source, msgData)
            Wait(50)
        end
    end)
end)
