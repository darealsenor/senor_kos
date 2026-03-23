local Redzones = {}
local Players = {}

local function shouldBroadcastToClients(zoneInstance)
    if zoneInstance.type == 'temporary' then return true end
    return zoneInstance.enabled ~= false
end

local function AddZone(zoneInstance)
    assert(zoneInstance, 'AddZone requires zone instance')
    table.insert(Redzones, zoneInstance)
    if shouldBroadcastToClients(zoneInstance) then
        TriggerClientEvent(Events.ADD_ZONE, -1, zoneInstance:get())
    end
end

local function AddZoneSilent(zoneInstance)
    assert(zoneInstance, 'AddZoneSilent requires zone instance')
    table.insert(Redzones, zoneInstance)
end

local function UpdateZone(zoneInstance, data)
    if not zoneInstance or type(zoneInstance) ~= 'table' or not data then return false end

    if data.name ~= nil then zoneInstance.name = data.name end
    if data.coords ~= nil then
        zoneInstance.coords = type(data.coords) == 'vector3' and data.coords or vec3(data.coords.x, data.coords.y, data.coords.z)
    end
    if data.radius ~= nil then zoneInstance.radius = data.radius end
    if data.bucket ~= nil then zoneInstance.bucket = data.bucket end
    if data.durationType ~= nil then zoneInstance.durationType = data.durationType end
    if data.duration ~= nil then zoneInstance.duration = tonumber(data.duration) or 0 end
    if data.loadout ~= nil then zoneInstance.loadout = data.loadout end
    if data.killstreaks ~= nil then zoneInstance.killstreaks = data.killstreaks end
    if data.blipName ~= nil then zoneInstance.blipName = data.blipName end
    if data.blipColour ~= nil then zoneInstance.blipColour = data.blipColour end
    if data.markerColour ~= nil then zoneInstance.markerColour = data.markerColour end
    if data.spawnPoints ~= nil then zoneInstance.spawnPoints = data.spawnPoints end
    if data.autoRevive ~= nil then zoneInstance.autoRevive = data.autoRevive end
    if data.enabled ~= nil and zoneInstance.type == 'permanent' then
        local wasEnabled = zoneInstance.enabled ~= false
        zoneInstance.enabled = data.enabled
        if wasEnabled and not zoneInstance.enabled then
            local playerIds = {}
            for playerId in pairs(zoneInstance.runtime.players) do playerIds[#playerIds + 1] = playerId end
            for j = 1, #playerIds do
                Loadout.removeLoadout(playerIds[j])
                Manager.RemovePlayerFromZone(playerIds[j])
            end
            TriggerClientEvent(Events.REMOVE_ZONE, -1, zoneInstance:get())
        elseif not wasEnabled and zoneInstance.enabled then
            TriggerClientEvent(Events.ADD_ZONE, -1, zoneInstance:get())
        end
    end

    if zoneInstance.type == 'permanent' then
        local payload = zoneInstance:get()
        payload.active = nil
        payload.startTime = nil
        MySQL.update.await('UPDATE redzones SET data = ? WHERE id = ?', { json.encode(payload), zoneInstance.id })
    end

    if shouldBroadcastToClients(zoneInstance) then
        TriggerClientEvent(Events.UPDATE_ZONE, -1, zoneInstance:get())
    end
    return true
end

local function RemoveZone(zoneInstance)
    if not zoneInstance or type(zoneInstance) ~= 'table' then
        return false
    end

    TriggerEvent('redzone:zoneRemoving', zoneInstance)

    for i = 1, #Redzones do
        if Redzones[i].id == zoneInstance.id then
            local playerIds = {}
            for playerId in pairs(zoneInstance.runtime.players) do playerIds[#playerIds + 1] = playerId end
            for j = 1, #playerIds do
                Loadout.removeLoadout(playerIds[j])
                Players[playerIds[j]] = nil
            end
            table.remove(Redzones, i)
            TriggerClientEvent(Events.REMOVE_ZONE, -1, zoneInstance:get())
            return true
        end
    end
    return false
end

local function GetZones(raw, forClients)
    if not raw then
        return Redzones
    end

    local zones = {}
    for i = 1, #Redzones do
        local zone = Redzones[i]
        if not forClients or shouldBroadcastToClients(zone) then
            zones[#zones + 1] = zone:get()
        end
    end
    return zones
end

local function GetZoneById(id)
    local sid = tostring(id)
    for i = 1, #Redzones do
        local zone = Redzones[i]
        if zone.id == id or tostring(zone.id) == sid then
            return zone
        end
    end
    return false
end

local function GetZoneByPlayer(source)
    return Players[source] or false
end

local function AddPlayerToZone(zone, source)
    assert(zone, 'AddPlayerToZone requires zone')
    Players[source] = zone
    zone:addPlayer(source)
end

local function RemovePlayerFromZone(source)
    local zone = Players[source]
    if zone then
        zone:removePlayer(source)
        Players[source] = nil
    end
end

local function CreateTemporaryZone(data)
    assert(data, 'CreateTemporaryZone requires data')
    data.type = 'temporary'
    data.id = data.id or ('temp-%d-%d'):format(os.time(), math.random(10000, 99999))
    local zone = Redzone:new(data)
    AddZone(zone)
    return zone
end

local function CreatePermanentZone(data)
    assert(data, 'CreatePermanentZone requires data')
    assert(data.name, 'CreatePermanentZone requires name')
    assert(data.coords, 'CreatePermanentZone requires coords')
    assert(data.radius, 'CreatePermanentZone requires radius')

    data.type = 'permanent'
    local payload = {
        name = data.name,
        type = data.type,
        coords = type(data.coords) == 'vector3' and { x = data.coords.x, y = data.coords.y, z = data.coords.z } or data.coords,
        radius = data.radius,
        bucket = data.bucket or 0,
        durationType = data.durationType,
        duration = data.duration or 0,
        loadout = data.loadout or {},
        killstreaks = data.killstreaks or {},
        blipName = data.blipName,
        blipColour = data.blipColour or 1,
        markerColour = data.markerColour or { 255, 42, 24, 120 },
        enabled = data.enabled ~= false,
        spawnPoints = data.spawnPoints or {},
        autoRevive = data.autoRevive ~= false,
    }
    local jsonData = json.encode(payload)
    local id = MySQL.insert.await('INSERT INTO redzones (type, data) VALUES (?, ?)', { 'permanent', jsonData })
    assert(id, 'Failed to insert permanent zone')
    data.id = id
    local zone = Redzone:new(data)
    AddZone(zone)
    return zone
end

Manager = {}

function Manager.AddZone(zoneInstance)
    AddZone(zoneInstance)
end

function Manager.AddZoneSilent(zoneInstance)
    AddZoneSilent(zoneInstance)
end

function Manager.UpdateZone(zoneInstance, data)
    return UpdateZone(zoneInstance, data)
end

function Manager.RemoveZone(zoneInstance)
    return RemoveZone(zoneInstance)
end

function Manager.GetZones(raw, forClients)
    return GetZones(raw, forClients)
end

function Manager.GetZoneById(id)
    return GetZoneById(id)
end

function Manager.GetZoneByPlayer(source)
    return GetZoneByPlayer(source)
end

function Manager.AddPlayerToZone(zone, source)
    AddPlayerToZone(zone, source)
end

function Manager.RemovePlayerFromZone(source)
    RemovePlayerFromZone(source)
end

function Manager.CreateTemporaryZone(data)
    return CreateTemporaryZone(data)
end

function Manager.CreatePermanentZone(data)
    return CreatePermanentZone(data)
end
