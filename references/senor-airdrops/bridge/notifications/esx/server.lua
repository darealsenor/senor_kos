local notifications = {}
local ESX = exports["es_extended"]:getSharedObject()

function notifications.Notify(playerId, data)
    if type(playerId) == 'table' then
        data = playerId
        playerId = nil
    end
    
    local message = data.description or data.title
    local notifType = 'info'
    
    if data.type == 'error' or data.type == 'danger' then
        notifType = 'error'
    elseif data.type == 'success' then
        notifType = 'success'
    elseif data.type == 'warning' then
        notifType = 'warning'
    elseif data.type == 'inform' then
        notifType = 'info'
    end
    
    if playerId and type(playerId) == 'number' then
        local xPlayer = ESX.GetPlayerFromId(playerId)
        if xPlayer then
            xPlayer.showNotification(message, notifType, data.duration or 5000)
        end
    else
        TriggerClientEvent('esx:showNotification', -1, message, notifType, data.duration or 5000)
    end
end

return notifications

