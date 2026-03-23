RegisterNetEvent('senor_topplayers:admin:open', function(payload)
    if not payload or type(payload) ~= 'table' then return end
    SendTopplayersConfig()
    toggleNuiFrame(true)
    SendNUIMessage({ action = 'setLeaderboardOpen', data = false })
    SendNUIMessage({
        action = 'setAdminData',
        data = {
            peds = payload.peds or {},
            props = payload.props or {},
            propList = payload.propList or {},
            animPresets = payload.animPresets or {},
        },
    })
end)

RegisterNUICallback('senor_topplayers:savePed', function(payload, cb)
    local data = type(payload) == 'table' and payload or {}
    if data.id ~= nil then data.id = tonumber(data.id) end
    cb(lib.callback.await('senor_topplayers:admin:savePed', false, data))
end)

RegisterNUICallback('senor_topplayers:saveProp', function(payload, cb)
    local data = type(payload) == 'table' and payload or {}
    if data.id ~= nil then data.id = tonumber(data.id) end
    cb(lib.callback.await('senor_topplayers:admin:saveProp', false, data))
end)

RegisterNUICallback('senor_topplayers:deletePed', function(payload, cb)
    cb(lib.callback.await('senor_topplayers:admin:deletePed', false, payload and payload.id))
end)

RegisterNUICallback('senor_topplayers:deleteProp', function(payload, cb)
    cb(lib.callback.await('senor_topplayers:admin:deleteProp', false, payload and payload.id))
end)

RegisterNUICallback('senor_topplayers:getPlayerCoords', function(_, cb)
    local coords = GetEntityCoords(cache.ped)
    local heading = GetEntityHeading(cache.ped)
    cb({ x = coords.x, y = coords.y, z = coords.z, w = heading })
end)

RegisterNUICallback('senor_topplayers:teleportTo', function(payload, cb)
    local c = payload and payload.coords
    if not c then cb({}) return end
    local x, y, z = tonumber(c.x), tonumber(c.y), tonumber(c.z)
    local w = tonumber(c.w) or 0
    if x and y and z then
        SetEntityCoords(cache.ped, x, y, z, false, false, false, false)
        SetEntityHeading(cache.ped, w)
    end
    cb({})
end)

RegisterNUICallback('senor_topplayers:startPlacement', function(payload, cb)
    cb({ ok = true })
    local propModel = type(payload) == 'table' and type(payload.propModel) == 'string' and payload.propModel ~= '' and payload.propModel or nil
    StartPlacement(propModel)
end)

RegisterNUICallback('senor_topplayers:searchPlayers', function(payload, cb)
    local query = type(payload) == 'table' and (payload.query or payload.search) or ''
    cb(lib.callback.await('senor_topplayers:admin:searchPlayers', false, query))
end)
