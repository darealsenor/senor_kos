local function clearAllZones()
    if State.currentZoneId then
        State.currentZoneId = nil
        State.inZone = false
        TriggerEvent('redzone:client:zoneExited')
    end
    State.clearAll()
end

local function setZones(data)
    local zones = data and data.zones or {}
    clearAllZones()
    for i = 1, #zones do
        Zone.createZone(zones[i])
    end
    Markers.runMarkersLoop()
end

RegisterNetEvent(Events.SET_ZONES, setZones)
RegisterNetEvent(Events.ADD_ZONE, Zone.createZone)
RegisterNetEvent(Events.UPDATE_ZONE, Zone.updateZone)
RegisterNetEvent(Events.REMOVE_ZONE, Zone.removeZone)

CreateThread(function()
    Wait(1000)
    TriggerServerEvent(Events.REQUEST_ZONES)
end)

AddEventHandler('redzone:client:playerLoaded', function()
    TriggerServerEvent(Events.REQUEST_ZONES)
end)
