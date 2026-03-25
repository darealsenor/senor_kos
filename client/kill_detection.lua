AddEventHandler('gameEventTriggered', function(event, data)
    if event ~= 'CEventNetworkEntityDamage' then return end
    if not KOSState.inMatch then return end

    local victimPed = data[1]
    local victimDied = data[4]
    if not victimPed or not victimDied or not IsPedAPlayer(victimPed) then return end

    if NetworkGetPlayerIndexFromPed(victimPed) ~= cache.playerId then return end
    if not IsPedDeadOrDying(cache.ped, true) and not IsPedFatallyInjured(cache.ped) then return end

    local headshot = false
    local found, bone = GetPedLastDamageBone(cache.ped)
    if found and (bone == 31086 or bone == 39317) then
        headshot = true
    end

    local killerPed = GetPedSourceOfDeath(cache.ped)
    local killerServerId = nil
    if killerPed and killerPed ~= cache.ped then
        local killerPlayerIndex = NetworkGetPlayerIndexFromPed(killerPed)
        if killerPlayerIndex and NetworkIsPlayerActive(killerPlayerIndex) then
            killerServerId = GetPlayerServerId(killerPlayerIndex)
        end
    end

    TriggerServerEvent('kos:playerDied', {
        killerServerId = killerServerId,
        headshot = headshot,
    })
end)
