local framework = {}

local function setSquadDeathState(isDead)
    TriggerServerEvent('squad:server:SetPlayerDeathState', isDead)
end

AddEventHandler('_playerLoaded', function(source, userId)
    TriggerEvent('squads:client:playerLoaded')
end)

AddEventHandler('playerDropped', function()
    TriggerEvent('squads:client:playerUnloaded')
end)

RegisterNetEvent('ox:playerDeath', function()
    setSquadDeathState(true)
end)

RegisterNetEvent('ox:playerRevived', function()
    setSquadDeathState(false)
end)

return framework
