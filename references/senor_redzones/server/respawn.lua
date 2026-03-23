local RESPAWN_FALLBACK_MARGIN = 10

Respawn = {}

---@param zone table Redzone instance
---@return table
function Respawn.getRespawnPayload(zone)
    lib.print.debug('Respawn.getRespawnPayload zone', {
        id = zone.id,
        name = zone.name,
        autoRevive = zone.autoRevive,
        radius = zone.radius,
    })
    local points = zone.spawnPoints
    local valid = {}
    if points and #points > 0 then
        for i = 1, #points do
            local p = points[i]
            local isTable = type(p) == 'table'
            local x = isTable and (tonumber(p.x) or p[1])
            local y = isTable and (tonumber(p.y) or p[2])
            local z = isTable and (tonumber(p.z) or p[3])
            if x and y and z then
                valid[#valid + 1] = { x = x, y = y, z = z, heading = isTable and (tonumber(p.heading) or p[4]) }
            end
        end
    end
    local c = zone.coords
    local fallback = { center = { x = c.x, y = c.y, z = c.z }, radius = zone.radius, margin = RESPAWN_FALLBACK_MARGIN }
    if zone.autoRevive then
        local payload = { autoRevive = true, spawnPoints = valid, fallback = fallback }
        lib.print.debug('Respawn.getRespawnPayload autoRevive payload', payload)
        return payload
    end
    if #valid > 0 then
        local pick = valid[math.random(1, #valid)]
        local payload = { x = pick.x, y = pick.y, z = pick.z, heading = pick.heading }
        lib.print.debug('Respawn.getRespawnPayload legacy spawn payload', payload)
        return payload
    end
    local payload = { fallback = true, center = fallback.center, radius = fallback.radius, margin = fallback.margin }
    lib.print.debug('Respawn.getRespawnPayload legacy fallback payload', payload)
    return payload
end
