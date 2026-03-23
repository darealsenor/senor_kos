AddEventHandler('onServerResourceStart', function(resourceName)
    if resourceName == GetCurrentResourceName() then
        Wait(1000)
        
        if Config.Channels and Config.Channels.default then
            for _, channelConfig in ipairs(Config.Channels.default) do
                chat:AddChannel(channelConfig.name, channelConfig.id, channelConfig.timeout)
                
                if channelConfig.permission then
                    local channel = chat:GetChannelByName(channelConfig.name)
                    if channel then
                        channel.permission = channelConfig.permission
                    end
                end
            end
        end
    end
end)

