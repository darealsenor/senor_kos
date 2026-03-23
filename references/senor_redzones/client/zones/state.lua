State = {
    Zones = {},
    currentZoneId = nil,
    inZone = false,
    MarkersDrawDistance = Config.markersDrawDistance or 150.0,
    DEFAULT_MARKER_COLOUR = Config.markerColour or { 255, 42, 24, 120 }
}
function State.getEntry(zoneId)
    return State.Zones[zoneId] or State.Zones[tostring(zoneId)] or State.Zones[tonumber(zoneId)]
end

function State.destroyEntry(entry)
    if entry.blip and type(entry.blip) == 'table' then
        for i = 1, #entry.blip do
            local b = entry.blip[i]
            if b and type(b) == 'number' and DoesBlipExist(b) then
                RemoveBlip(b)
            end
        end
    end
    if entry.zone and entry.zone.remove then
        entry.zone:remove()
    end
end

function State.removeEntry(zoneId)
    if zoneId == nil then return end
    local entry = State.getEntry(zoneId)
    if not entry then return end
    State.destroyEntry(entry)
    for k in pairs(State.Zones) do
        if State.Zones[k] == entry then
            State.Zones[k] = nil
        end
    end
end

function State.clearAll()
    local keys = {}
    for k in pairs(State.Zones) do keys[#keys + 1] = k end
    for i = 1, #keys do
        State.destroyEntry(State.Zones[keys[i]])
        State.Zones[keys[i]] = nil
    end
end

