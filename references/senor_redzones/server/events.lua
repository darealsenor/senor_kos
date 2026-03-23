RegisterNetEvent(Events.PLAYER_ENTERED, function(zoneId)
    local source = source
    local zone = Manager.GetZoneById(zoneId)
    if zone then
        Manager.AddPlayerToZone(zone, source)
        if zone.bucket and zone.bucket > 0 then
            Bridge.framework.SetPlayerBucket(source, zone.bucket)
        end
        Loadout.giveLoadout(source, zone.loadout)
        Logger.log(source, 'RedzoneEnter', ('Entered zone "%s" (id %s)'):format(zone.name, zone.id))
        local playerIds = {}
        for playerId in pairs(zone.runtime.players) do playerIds[#playerIds + 1] = playerId end
        for i = 1, #playerIds do
            local leaderboard = zone:getLeaderboard(playerIds[i])
            TriggerClientEvent(Events.LEADERBOARD_UPDATE, playerIds[i], leaderboard)
        end
    end
end)

RegisterNetEvent(Events.PLAYER_EXITED, function(zoneId)
    local source = source
    local zone = Manager.GetZoneById(zoneId)
    if not zone then return end
    Loadout.removeLoadout(source)
    if zone.bucket then
        Bridge.framework.SetPlayerBucket(source, 0)
    end
    Logger.log(source, 'RedzoneExit', ('Exited zone "%s" (id %s)'):format(zone.name, zone.id))
    Manager.RemovePlayerFromZone(source)
    local playerIds = {}
    for playerId in pairs(zone.runtime.players) do playerIds[#playerIds + 1] = playerId end
    for i = 1, #playerIds do
        local leaderboard = zone:getLeaderboard(playerIds[i])
        TriggerClientEvent(Events.LEADERBOARD_UPDATE, playerIds[i], leaderboard)
    end
end)

RegisterNetEvent(Events.REQUEST_ZONES, function()
    local src = source
    if not src or src == 0 then return end
    while not ZonesLoaded do
        Wait(50)
    end
    local zones = Manager.GetZones(true, true)
    TriggerClientEvent(Events.SET_ZONES, src, { zones = zones })
end)

RegisterNetEvent(Events.PLAYER_REVIVED, function()
    local source = source
    local zone = Manager.GetZoneByPlayer(source)
    if zone then
        if zone.runtime and zone.runtime.processedDeaths then
            zone.runtime.processedDeaths[source] = nil
        end
        Loadout.removeLoadout(source)
        Loadout.giveLoadout(source, zone.loadout)
    end
end)

AddEventHandler(Events.PLAYER_DROPPED, function(playerId)
    Manager.RemovePlayerFromZone(playerId)
end)

AddEventHandler('redzone:zoneRemoving', function(zone)
    if not zone or not zone.runtime or not zone.runtime.players then return end
    local playerIds = {}
    for playerId in pairs(zone.runtime.players) do playerIds[#playerIds + 1] = playerId end
    for i = 1, #playerIds do Loadout.removeLoadout(playerIds[i]) end
end)

local function broadcastZoneLeaderboard(zone)
    local playerIds = {}
    for playerId in pairs(zone.runtime.players) do playerIds[#playerIds + 1] = playerId end
    for i = 1, #playerIds do
        local leaderboard = zone:getLeaderboard(playerIds[i])
        TriggerClientEvent(Events.LEADERBOARD_UPDATE, playerIds[i], leaderboard)
    end
end

local function tryZoneExpired(zone)
    if not zone:checkExpired() then return end
    local targets = {}
    for playerId in pairs(zone.runtime.players) do targets[#targets + 1] = playerId end
    if #targets > 0 then
        lib.triggerClientEvent(Events.ZONE_END_RESULTS, targets, zone:getEndResults())
    end
    Logger.log(-1, 'RedzoneEnd', ('Temporary zone "%s" (id %s) ended'):format(zone.name, zone.id), 'Redzone ended')
    Manager.RemoveZone(zone)
end

local function handlePlayerDied(victim, killerId)
    if killerId and killerId >= 1 then
        local zone = Manager.GetZoneByPlayer(killerId)
        if zone then
            if zone.runtime.players[victim] then
                if zone.runtime.processedDeaths[victim] then return end
                zone.runtime.processedDeaths[victim] = true
                Loadout.removeLoadout(victim)
                zone:onKill(killerId, victim)
                Logger.log(killerId, 'RedzoneKill', ('Kill in zone "%s": %s killed %s'):format(zone.name, killerId, victim))
                broadcastZoneLeaderboard(zone)
                tryZoneExpired(zone)
            end
            TriggerClientEvent(Events.RESPAWN_AT, victim, Respawn.getRespawnPayload(zone))
        end
        return
    end

    local zone = Manager.GetZoneByPlayer(victim)
    if not zone or not zone.runtime.players[victim] then return end
    if zone.runtime.processedDeaths[victim] then return end
    zone.runtime.processedDeaths[victim] = true
    Loadout.removeLoadout(victim)
    zone:onPlayerDeath(victim)
    Logger.log(victim, 'RedzoneDeath', ('Death in zone "%s" (id %s)'):format(zone.name, zone.id))
    broadcastZoneLeaderboard(zone)
    tryZoneExpired(zone)
    TriggerClientEvent(Events.RESPAWN_AT, victim, Respawn.getRespawnPayload(zone))
end

RegisterNetEvent(Events.PLAYER_DIED, function(payload)
    local killerId = type(payload) == 'table' and payload.killerServerId or nil
    if killerId and killerId < 1 then killerId = nil end
    handlePlayerDied(source, killerId)
end)
