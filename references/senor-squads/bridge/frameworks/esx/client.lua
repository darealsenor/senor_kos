local framework = {}

local function setSquadDeathState(isDead)
    TriggerServerEvent('squad:server:SetPlayerDeathState', isDead)
end

RegisterNetEvent('esx:playerLoaded', function(xPlayer, skin)
    TriggerEvent('squads:client:playerLoaded')
end)

RegisterNetEvent('esx:onPlayerLogout', function()
    TriggerEvent('squads:client:playerUnloaded')
end)

AddEventHandler('baseevents:onPlayerWasted', function()
    setSquadDeathState(true)
end)

RegisterNetEvent('esx_ambulancejob:revive', function()
    setSquadDeathState(false)
end)

return framework
