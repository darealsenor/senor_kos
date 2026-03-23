local framework = {}

RegisterNetEvent('esx:playerLoaded', function(xPlayer, skin)
    TriggerEvent('senor-chat:playerLoaded')
end)

RegisterNetEvent('esx:onPlayerLogout', function()
    TriggerEvent('senor-chat:playerUnloaded')
end)

return framework
