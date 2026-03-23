local framework = {}

AddEventHandler('playerSpawned', function()
    TriggerEvent('senor-chat:playerLoaded')
end)

AddEventHandler('onResourceStop', function(resourceName)
    if resourceName == GetCurrentResourceName() then
        TriggerEvent('senor-chat:playerUnloaded')
    end
end)

return framework

