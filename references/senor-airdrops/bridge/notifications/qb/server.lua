local notifications = {}
local QBCore = exports["qb-core"]:GetCoreObject()

function notifications.Notify(playerId, data)
    if type(playerId) == 'table' then
        data = playerId
        playerId = nil
    end
    
    if not data then return end
    
    local message = data.description or data.title or 'Notification'
    local notifType = data.type or 'primary'
    if notifType == 'inform' then
        notifType = 'info'
    end
    local duration = data.duration or 5000
    
    if playerId and type(playerId) == 'number' then
        QBCore.Functions.Notify(playerId, message, notifType, duration)
    else
        TriggerClientEvent('QBCore:Notify', -1, message, notifType, duration)
    end
end

return notifications

