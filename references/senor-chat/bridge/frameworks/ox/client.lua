local framework = {}

AddEventHandler('_playerLoaded', function(source, userId)
    TriggerEvent('senor-chat:playerLoaded')
end)

AddEventHandler('playerDropped', function()
    TriggerEvent('senor-chat:playerUnloaded')
end)

return framework
