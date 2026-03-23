local notifications = {}

function notifications.Notify(playerId, data)
    if type(playerId) == 'table' then
        data = playerId
        playerId = nil
    end
    
    if not data then return end
    
    if playerId and type(playerId) == 'number' then
        TriggerClientEvent('ox_lib:notify', playerId, data)
    else
        TriggerClientEvent('ox_lib:notify', -1, data)
    end
end

return notifications

