local RESPAWN_DELAY_MS = (type(Config.respawnDelayMs) == 'number' and Config.respawnDelayMs > 0) and Config.respawnDelayMs or 2000
local OCCUPIED_RADIUS = (type(Config.spawnOccupiedRadius) == 'number' and Config.spawnOccupiedRadius > 0) and Config.spawnOccupiedRadius or 2.0

---@param px number
---@param py number
---@param pz number
---@return boolean
local function isPointOccupied(px, py, pz)
    local myPed = cache.ped
    local point = vector3(px, py, pz)
    for _, playerId in ipairs(GetActivePlayers()) do
        local ped = GetPlayerPed(playerId)
        if ped and ped ~= myPed and DoesEntityExist(ped) then
            if #(point - GetEntityCoords(ped)) < OCCUPIED_RADIUS then
                return true
            end
        end
    end
    return false
end

---@param fallback table
---@return table|nil
local function oneFallbackPoint(fallback)
    if not fallback or not fallback.center or not fallback.radius then return nil end
    local cx, cy, cz = fallback.center.x or 0.0, fallback.center.y or 0.0, fallback.center.z or 0.0
    local margin = fallback.margin or 10
    local dist = fallback.radius + margin
    local angle = math.random() * 2 * math.pi
    for _ = 1, 5 do
        local x = cx + dist * math.cos(angle)
        local y = cy + dist * math.sin(angle)
        local found, groundZ = GetGroundZFor_3dCoord(x, y, cz + 50.0, 0)
        if found then
            local heading = math.deg(math.atan2(cx - x, cy - y))
            lib.print.debug('respawn oneFallbackPoint hit', { x = x, y = y, z = groundZ, heading = heading })
            return { x = x, y = y, z = groundZ, heading = heading }
        end
        angle = math.random() * 2 * math.pi
    end
    lib.print.debug('respawn oneFallbackPoint failed', { center = fallback.center, radius = fallback.radius, margin = margin })
    return nil
end

---@param t table
local function shuffle(t)
    for i = #t, 2, -1 do
        local j = math.random(i)
        t[i], t[j] = t[j], t[i]
    end
end


---@param payload table
---@return table|nil, boolean
local function pickAutoRevivePoint(payload)
    lib.print.debug('respawn pickAutoRevivePoint payload', payload)
    local raw = payload.spawnPoints
    if raw and #raw > 0 then
        local candidates = {}
        for i = 1, #raw do
            local p = raw[i]
            local x = tonumber(p.x) or tonumber(p[1])
            local y = tonumber(p.y) or tonumber(p[2])
            local z = tonumber(p.z) or tonumber(p[3])
            if x and y and z then
                candidates[#candidates + 1] = { x = x, y = y, z = z, heading = tonumber(p.heading) or tonumber(p[4]) }
            end
        end
        if #candidates == 0 then
            lib.print.debug('respawn pickAutoRevivePoint no valid candidates from spawnPoints', raw)
            return nil, false
        end
        shuffle(candidates)
        local pick = candidates[1]
        lib.print.debug('respawn pickAutoRevivePoint picked spawn', pick)
        return pick, true
    end
    if payload.fallback then
        local fb = oneFallbackPoint(payload.fallback)
        lib.print.debug('respawn pickAutoRevivePoint using fallback', fb)
        return fb, false
    end
    lib.print.debug('respawn pickAutoRevivePoint no point', {})
    return nil, false
end

---@param payload table
---@return table|nil, boolean
local function pointFromLegacyPayload(payload)
    local x, y, z = tonumber(payload.x), tonumber(payload.y), tonumber(payload.z)
    if x and y and z then
        local pt = { x = x, y = y, z = z, heading = tonumber(payload.heading) or 0 }
        lib.print.debug('respawn pointFromLegacyPayload direct', pt)
        return pt, false
    end
    if payload.fallback and payload.center and payload.radius then
        local fb = oneFallbackPoint({ center = payload.center, radius = payload.radius, margin = payload.margin })
        lib.print.debug('respawn pointFromLegacyPayload fallback', fb)
        return fb, false
    end
    lib.print.debug('respawn pointFromLegacyPayload invalid payload', payload)
    return nil, false
end

RegisterNetEvent(Events.RESPAWN_AT, function(payload)
    lib.print.debug('respawn RESPawn_AT payload', payload)
    if not payload then return end

    local pt, fromSpawnPoints
    if payload.autoRevive then
        pt, fromSpawnPoints = pickAutoRevivePoint(payload)
    else
        pt, fromSpawnPoints = pointFromLegacyPayload(payload)
    end

    if not pt then return end

    local x = pt.x
    local y = pt.y
    local z = pt.z
    local heading = pt.heading or 0

    Wait(RESPAWN_DELAY_MS)

    if not fromSpawnPoints then
        local groundFound, groundZ = GetGroundZFor_3dCoord(x, y, z + 50.0, 0)
        lib.print.debug('respawn ground check (fallback)', { x = x, y = y, z = z, found = groundFound, groundZ = groundZ })
        if groundFound and type(groundZ) == 'number' then
            z = groundZ
        end
    else
        lib.print.debug('respawn using spawn point z (no ground clamp)', { x = x, y = y, z = z })
    end

    lib.print.debug('respawn final revive coords', { x = x, y = y, z = z, heading = heading })
    Bridge.framework.Revive(x, y, z, heading)
    TriggerServerEvent(Events.PLAYER_REVIVED)
end)
