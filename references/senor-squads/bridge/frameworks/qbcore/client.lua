local framework = {}

local function setSquadDeathState(isDead)
    TriggerServerEvent('squad:server:SetPlayerDeathState', isDead)
end

AddEventHandler('QBCore:Client:OnPlayerLoaded', function()
    TriggerEvent('squads:client:playerLoaded')
end)

AddEventHandler('QBCore:Client:OnPlayerUnload', function()
    TriggerEvent('squads:client:playerUnloaded')
end)

AddEventHandler('baseevents:onPlayerWasted', function()
    setSquadDeathState(true)
end)

RegisterNetEvent('hospital:client:Revive', function()
    setSquadDeathState(false)
end)

return framework