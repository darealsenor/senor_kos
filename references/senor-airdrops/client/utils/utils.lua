local function Notification(title, description, type)
    Bridge.notify.Notify({
        id = 'Airdrops',
        title = title,
        description = description,
        type = type or 'inform'
    })
end

local function GetStreetNameAtCoords(coords)
    local street = GetStreetNameAtCoord(coords.x, coords.y, coords.z)
    return GetStreetNameFromHashKey(street) or 'SENORA FREEWAY'
end

local function Draw3DText(x, y, z, scl_factor, text)
    local onScreen, _x, _y = World3dToScreen2d(x, y, z)
    local p = GetGameplayCamCoords()
    local distance = GetDistanceBetweenCoords(p.x, p.y, p.z, x, y, z, 1)
    local scale = (1 / distance) * 2
    local fov = (1 / GetGameplayCamFov()) * 100
    local scale = scale * fov * scl_factor
    if onScreen then
        SetTextScale(0.0, scale)
        SetTextFont(0)
        SetTextProportional(1)
        SetTextColour(255, 255, 255, 255)
        SetTextDropshadow(0, 0, 0, 0, 255)
        SetTextEdge(2, 0, 0, 0, 150)
        SetTextDropShadow()
        SetTextOutline()
        SetTextEntry("STRING")
        SetTextCentre(1)
        AddTextComponentString(text)
        DrawText(_x, _y)
    end
end

local function GetWaypointCoords()
    local waypointBlip = GetFirstBlipInfoId(8)
    if not DoesBlipExist(waypointBlip) then return false end

    return GetBlipInfoIdCoord(waypointBlip)
end

local function CanOpenDrop()
    return not Bridge.framework.IsDead()
end


return {
    Notification = Notification,
    GetStreetNameAtCoords = GetStreetNameAtCoords,
    Draw3DText = Draw3DText,
    GetWaypointCoords = GetWaypointCoords,
    CanOpenDrop = CanOpenDrop,
}
