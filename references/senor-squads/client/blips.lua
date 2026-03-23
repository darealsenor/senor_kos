-- local function addBlipForEntity(entity, name)
--     local blip = AddBlipForEntity(entity)
--     Squad.Blips[entity] = blip
--     SetBlipColour(blip, 2)
--     SetBlipScale(blip, 0.85)
--     SetBlipAsFriendly(blip, true)

--     BeginTextCommandSetBlipName("STRING")
--     AddTextComponentString(('Squad %s'):format(name) or "Squad Member")
--     EndTextCommandSetBlipName(blip)
-- end

local function addBlipForCoord(coord, name)
    local blip = AddBlipForCoord(coord.x, coord.y, coord.z)
    Squad.Blips[#Squad.Blips + 1] = blip
    SetBlipColour(blip, Squad.Settings.Blips.color)
    SetBlipScale(blip, 0.85)
    -- SetBlipAsFriendly(blip, true)

    BeginTextCommandSetBlipName("STRING")
    AddTextComponentString(('Squad %s'):format(name) or "Squad Member")
    EndTextCommandSetBlipName(blip)
end

local function removeBlips()
    for _, entity in pairs(Squad.Blips) do
        RemoveBlip(entity)
    end
    Squad.Blips = {}
end

function ToggleBlips(bool)
    if not Config.Settings['Blips'] then return end

    removeBlips()
    if not bool then return end
    if Squad.Settings.Blips.enabled and Squad.mySquad and Squad.mySquad.players and #Squad.mySquad.players then
        for _, player in ipairs(Squad.mySquad.players) do
            if player.serverId ~= cache.serverId then
                addBlipForCoord(player.coords, player.name)
            end
        end
    end
end

AddEventHandler('onResourceStop', function(resourceName)
    if (GetCurrentResourceName() == resourceName) then
        removeBlips()
    end
end)
