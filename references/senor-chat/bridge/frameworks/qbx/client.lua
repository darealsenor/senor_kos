local framework = {}

AddEventHandler('QBCore:Client:OnPlayerLoaded', function()
    TriggerEvent('senor-chat:playerLoaded')
end)

AddEventHandler('QBCore:Client:OnPlayerUnload', function()
    TriggerEvent('senor-chat:playerUnloaded')
end)

return framework
