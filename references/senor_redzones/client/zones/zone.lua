Zone = {}

function Zone.onZoneEnter(serverZoneId)
    if not State.getEntry(serverZoneId) then return end
    State.currentZoneId = serverZoneId
    State.inZone = true
    TriggerServerEvent(Events.PLAYER_ENTERED, serverZoneId)
    TriggerEvent('redzone:client:zoneEntered')
end

function Zone.onZoneExit(serverZoneId)
    local hadEntry = State.getEntry(serverZoneId) ~= nil
    State.currentZoneId = nil
    State.inZone = false
    if hadEntry then
        TriggerServerEvent(Events.PLAYER_EXITED, serverZoneId)
    end
    TriggerEvent('redzone:client:zoneExited')
end

function Zone.removeZone(data)
    local zoneId = type(data) == 'table' and data.id or data
    if zoneId == nil then return end
    if State.currentZoneId and tostring(State.currentZoneId) == tostring(zoneId) then
        State.currentZoneId = nil
        State.inZone = false
        TriggerEvent('redzone:client:zoneExited')
    end
    State.removeEntry(zoneId)
end

function Zone.createZone(data)
    local serverZoneId = data.id
    local coords = vec3(data.coords.x, data.coords.y, data.coords.z)
    local zone = lib.zones.sphere({
        coords = coords,
        radius = data.radius,
        onEnter = function() Zone.onZoneEnter(serverZoneId) end,
        onExit = function() Zone.onZoneExit(serverZoneId) end,
        debug = false,
    })
    local blip = Blips.createBlip(data)
    State.Zones[serverZoneId] = {
        zone = zone,
        blip = blip,
        coords = coords,
        radius = data.radius,
        markerColour = data.markerColour or State.DEFAULT_MARKER_COLOUR,
    }
    Markers.runMarkersLoop()
end

function Zone.updateZone(data)
    Zone.removeZone(data)
    Zone.createZone(data)
end
