local notifications = {}

---@param source number
---@param message string
---@param notifType string|nil
function notifications.Notify(source, message, notifType)
    if source <= 0 then
        return
    end
    TriggerClientEvent('QBCore:Notify', source, message, notifType or 'primary')
end

return notifications
