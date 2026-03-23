local notifications = {}

function notifications.Notify(playerId, data)
    if type(playerId) == 'table' then
        data = playerId
        playerId = nil
    end
    
    if not data then return end
    
    local message = data.description or data.title or 'Notification'
    
    if playerId and type(playerId) == 'number' then
        TriggerClientEvent('chat:addMessage', playerId, {
            color = { 255, 255, 255 },
            multiline = true,
            args = { locale('notification_title'), message }
        })
    else
        TriggerClientEvent('chat:addMessage', -1, {
            color = { 255, 255, 255 },
            multiline = true,
            args = { locale('notification_title'), message }
        })
    end
end

return notifications

