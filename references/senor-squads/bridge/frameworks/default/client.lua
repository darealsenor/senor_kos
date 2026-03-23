local function setSquadDeathState(isDead)
    TriggerServerEvent('squad:server:SetPlayerDeathState', isDead)
end

AddEventHandler('Loaded', function()
    TriggerEvent('squads:client:playerLoaded')
end)

AddEventHandler('Unload', function()
    TriggerEvent('squads:client:playerUnloaded')
end)

AddEventHandler('baseevents:onPlayerWasted', function()
    setSquadDeathState(true)
end)