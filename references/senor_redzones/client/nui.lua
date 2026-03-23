function SendReactMessage(action, data)
    SendNUIMessage({ action = action, data = data })
end

local lang = GetConvar and GetConvar('ox:locale', 'en') or 'en'
local path = ('locales.%s'):format(lang)
local UILocales = lib.loadJson(path) or lib.loadJson('locales.en') or {}

function ToggleNuiFrame(shouldShow)
    SetNuiFocus(shouldShow, shouldShow)
    SendReactMessage('setVisible', shouldShow or State.inZone)
end

local scoreboardKeybind = lib.addKeybind({
    name = '_redzone_scoreboard',
    description = locale('scoreboard_toggle'),
    defaultKey = Config.scoreboardKey,
    disabled = true,
    onPressed = function()
        if State.inZone and not IsNuiFocused() then
            SendReactMessage('scoreboardToggle', {})
        end
    end,
})

AddEventHandler('redzone:client:zoneEntered', function()
    if scoreboardKeybind then scoreboardKeybind:disable(false) end
    SendReactMessage('setVisible', true)
    SendReactMessage('redzone:config', {
        hudPosition = Config.hudPosition or 'top-right',
        scoreboardKey = Config.scoreboardKey,
        miniScoreboardEnabled = Config.miniScoreboardEnabled ~= false,
        scoreboardEnabled = Config.scoreboardEnabled ~= false,
        endOfGameResultsEnabled = Config.endOfGameResultsEnabled ~= false,
        locale = UILocales,
        theme = Config.theme,
    })
end)

AddEventHandler('redzone:client:zoneExited', function()
    if scoreboardKeybind then scoreboardKeybind:disable(true) end
    SendReactMessage('zoneExited', {})
end)

RegisterNetEvent(Events.LEADERBOARD_UPDATE, function(data)
    SendReactMessage('leaderboardUpdate', data)
end)

RegisterNetEvent(Events.ZONE_END_RESULTS, function(data)
    SendReactMessage('setVisible', true)
    SendReactMessage('zoneEndResults', data)
end)

RegisterNUICallback('hideFrame', function(_, cb)
    ToggleNuiFrame(false)
    cb({})
end)

RegisterNUICallback('redzone:getZones', function(_, cb)
    cb(lib.callback.await('redzone:server:getZones', false))
end)

RegisterNUICallback('redzone:getPlayerCoords', function(_, cb)
    local c = GetEntityCoords(cache.ped)
    cb({ success = true, coords = { x = c.x, y = c.y, z = c.z } })
end)

RegisterNUICallback('redzone:teleportTo', function(data, cb)
    local x = tonumber(data and data.x)
    local y = tonumber(data and data.y)
    local z = tonumber(data and data.z)
    if not x or not y or not z then cb({ success = false }) return end
    local heading = tonumber(data.heading) or 0
    SetEntityCoords(cache.ped, x, y, z, false, false, false, false)
    SetEntityHeading(cache.ped, heading)
    cb({ success = true })
end)

RegisterNUICallback('redzone:getPlayerLocation', function(_, cb)
    local c = GetEntityCoords(cache.ped)
    local x, y, z = c.x, c.y, c.z
    local streetHash = GetStreetNameAtCoord(x, y, z)
    local street = streetHash and GetStreetNameFromHashKey(streetHash) or ''
    if street == '' then street = 'Unknown' end
    cb({ success = true, coords = { x = x, y = y, z = z }, street = street })
end)

RegisterNUICallback('redzone:getGroundZ', function(data, cb)
    local x = tonumber(data.x)
    local y = tonumber(data.y)
    if not x or not y then
        cb({ success = false, z = 0 })
        return
    end
    CreateThread(function()
        local ped = cache.ped
        local ox, oy, oz = GetEntityCoords(ped)
        RequestCollisionAtCoord(x + 0.0, y + 0.0, 100.0)
        SetEntityCoords(ped, x + 0.0, y + 0.0, 300.0, false, false, false, false)
        local found, groundZ = false, 0
        for _ = 1, 10 do
            Wait(100)
            found, groundZ = GetGroundZFor_3dCoord(x + 0.0, y + 0.0, 200.0, 0)
            if found then break end
        end
        SetEntityCoords(ped, ox, oy, oz, false, false, false, false)
        cb({ success = found, z = groundZ or 0 })
    end)
end)

RegisterNUICallback('redzone:startSpawnPointPlacement', function(data, cb)
    local list = {}
    local raw = data and data.spawnPoints
    if raw then
        for i = 1, #raw do
            local p = raw[i]
            local x = tonumber(p.x) or tonumber(p[1])
            local y = tonumber(p.y) or tonumber(p[2])
            local z = tonumber(p.z) or tonumber(p[3])
            if x and y and z then
                list[#list + 1] = { x = x, y = y, z = z, heading = tonumber(p.heading) or tonumber(p[4]) }
            end
        end
    end
    StartSpawnPointPlacement(list, function(res)
        if res.cancelled then
            cb({ cancelled = true })
        elseif res.spawnPoints then
            cb({ spawnPoints = res.spawnPoints })
        else
            cb({})
        end
    end)
end)

RegisterNUICallback('redzone:createZone', function(data, cb)
    cb(lib.callback.await('redzone:server:createZone', false, data))
end)

RegisterNUICallback('redzone:updateZone', function(data, cb)
    cb(lib.callback.await('redzone:server:updateZone', false, data))
end)

RegisterNUICallback('redzone:deleteZone', function(data, cb)
    cb(lib.callback.await('redzone:server:deleteZone', false, data))
end)

RegisterNUICallback('redzone:getPresets', function(_, cb)
    cb(lib.callback.await('redzone:server:getPresets', false))
end)

RegisterNUICallback('redzone:createPreset', function(data, cb)
    cb(lib.callback.await('redzone:server:createPreset', false, data))
end)

RegisterNUICallback('redzone:deletePreset', function(data, cb)
    cb(lib.callback.await('redzone:server:deletePreset', false, data))
end)

local function BuildLoadoutItems()
    local list = {}
    local items = Bridge.inventory.Items()
    if items then
        for name, value in pairs(items) do
            if type(name) == 'string' then
                list[#list + 1] = { name = name, label = value and (value.label or value.name) or name }
            end
        end
    end
    return list
end

RegisterNetEvent('redzone:client:openAdmin', function(zones)
    ToggleNuiFrame(true)
    SendReactMessage('adminOpen', {
        zones = zones or {},
        loadoutItems = BuildLoadoutItems(),
        locale = UILocales,
        theme = Config.theme or { primary = '#f20d18' },
        defaults = {
            zoneRadius = Config.defaultZoneRadius or 50,
            durationKills = Config.defaultDurationKills or 3,
            durationTime = Config.defaultDurationTime or 300,
            blipColour = Config.blipColour,
            markerColour = Config.markerColour,
            hudPosition = Config.hudPosition,
        },
    })
end)
