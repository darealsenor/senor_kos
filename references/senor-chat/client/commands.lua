RegisterNetEvent('senor-chat:client:sendProximityMessage', function(msgData)
    if not msgData.senderId or not msgData.proximityRange then return end
    
    local senderId = msgData.senderId
    local range = msgData.proximityRange
    local localServerId = cache.serverId or GetPlayerServerId(PlayerId())
    
    if senderId == localServerId then
        return
    end
    
    local senderPlayer = GetPlayerFromServerId(senderId)
    if senderPlayer == -1 then return end
    
    local senderPed = GetPlayerPed(senderPlayer)
    if senderPed == 0 then return end
    
    local senderCoords = GetEntityCoords(senderPed)
    local playerCoords = GetEntityCoords(PlayerPedId())
    local distance = #(senderCoords - playerCoords)
    
    if distance <= range then
        msgData.senderId = nil
        msgData.proximityRange = nil
        
        if msgData.channel and msgData.channel.id then
            TriggerEvent('senor-chat:client:newMessage', msgData)
        end
    end
end)

RegisterNetEvent('senor-chat:client:clearChat', function()
    SendReactMessage('clearChat')
end)

