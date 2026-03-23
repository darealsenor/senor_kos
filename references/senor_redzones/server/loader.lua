ZonesLoaded = false

local function LoadPermanentZones()
    local rows = MySQL.query.await('SELECT * FROM redzones WHERE type = ?', { 'permanent' })
    if not rows then
        ZonesLoaded = true
        return
    end

    for i = 1, #rows do
        local row = rows[i]
        local data = json.decode(row.data)
        if data then
            data.id = tonumber(row.id) or row.id
            data.type = 'permanent'
            data.coords = vec3(data.coords.x, data.coords.y, data.coords.z)
            if type(data.spawnPoints) ~= 'table' then data.spawnPoints = {} end
            if data.autoRevive == nil then data.autoRevive = true end
            local zone = Redzone:new(data)
            Manager.AddZoneSilent(zone)
        end
    end
    ZonesLoaded = true
end

CreateThread(function()
    LoadPermanentZones()
end)

CreateThread(function()
    while true do
        Wait(1000)
        local zones = Manager.GetZones(false)
        local toRemove = {}
        for i = 1, #zones do
            local zone = zones[i]
            if zone.type == 'temporary' and zone.durationType == 'time' and zone.duration and zone.duration > 0 and zone:checkExpired() then
                toRemove[#toRemove + 1] = zone
            end
        end
        for j = 1, #toRemove do
            local zone = toRemove[j]
            local endResults = zone:getEndResults()
            local targets = {}
            for playerId in pairs(zone.runtime.players) do
                targets[#targets + 1] = playerId
            end
            if #targets > 0 then
                lib.triggerClientEvent(Events.ZONE_END_RESULTS, targets, endResults)
            end
            Logger.log(-1, 'RedzoneEnd', ('Zone "%s" (id %s) expired'):format(zone.name, zone.id), 'Redzone ended')
            Manager.RemoveZone(zone)
        end
    end
end)
