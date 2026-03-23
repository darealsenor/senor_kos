AddEventHandler('gameEventTriggered', function(event, data)
    if event ~= 'CEventNetworkEntityDamage' then return end
    if not State.inZone then return end

    local victimPed = data[1]
    local victimDied = data[4]
    if not victimPed or not victimDied or not IsPedAPlayer(victimPed) then return end

    if NetworkGetPlayerIndexFromPed(victimPed) ~= cache.playerId then return end
    if not IsPedDeadOrDying(cache.ped, true) and not IsPedFatallyInjured(cache.ped) then return end

    local killerPed = GetPedSourceOfDeath(cache.ped)
    local killerServerId = nil
    if killerPed and killerPed ~= cache.ped then
        local killerPlayerIndex = NetworkGetPlayerIndexFromPed(killerPed)
        if killerPlayerIndex and NetworkIsPlayerActive(killerPlayerIndex) then
            killerServerId = GetPlayerServerId(killerPlayerIndex)
        end
    end

    TriggerServerEvent(Events.PLAYER_DIED, {
        killerServerId = killerServerId,
    })
end)
