local notifications = {}

---@param source number
---@param message string
---@param _notifType string|nil
function notifications.Notify(source, message, _notifType)
    if source <= 0 then
        return
    end
    TriggerClientEvent('esx:showNotification', source, message)
end

return notifications
