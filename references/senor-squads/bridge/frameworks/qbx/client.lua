local framework = {}

local function setSquadDeathState(isDead)
    TriggerServerEvent('squad:server:SetPlayerDeathState', isDead)
end

local serverId = GetPlayerServerId(PlayerId())
local stateBagKey = ('player:%s'):format(serverId)
AddStateBagChangeHandler('qbx_medical:deathState', stateBagKey, function(_, _, value)
    setSquadDeathState(value == 2 or value == 3)
end)

AddEventHandler('QBCore:Client:OnPlayerLoaded', function()
    TriggerEvent('squads:client:playerLoaded')
    setSquadDeathState(LocalPlayer.state['qbx_medical:deathState'] == 2 or LocalPlayer.state['qbx_medical:deathState'] == 3)
end)

AddEventHandler('QBCore:Client:OnPlayerUnload', function()
    TriggerEvent('squads:client:playerUnloaded')
end)

RegisterNetEvent('hospital:client:Revive', function()
    setSquadDeathState(false)
end)

RegisterNetEvent('qbx_medical:client:playerRevived', function()
    setSquadDeathState(false)
end)

return framework
