local notifications = {}

---@param source number
---@param message string
---@param notifType string|nil
function notifications.Notify(source, message, notifType)
    if source <= 0 then
        return
    end
    TriggerClientEvent('ox_lib:notify', source, {
        type = notifType or 'inform',
        description = message,
    })
end

return notifications
