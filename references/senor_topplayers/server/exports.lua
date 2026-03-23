---Returns current cached stats for a player, or nil if not loaded.
---@param playerId number
---@return table|nil
function GetPlayerStats(playerId)
    if not PlayerStats then return nil end
    local cached = PlayerStats[playerId]
    if not cached then return nil end
    local out = {}
    for k, v in pairs(cached) do
        if k ~= "sessionStartTime" and k ~= "dirty" then
            out[k] = v
        end
    end
    return out
end

---Adds a numeric value to a stat field. Updates cache only; persisted on player drop.
---@param playerId number
---@param field string
---@param value number
---@return boolean
function AddPlayerStat(playerId, field, value)
    if field == 'money' or not ALLOWED_STAT_FIELDS[field] or type(value) ~= "number" then return false end
    local cached = PlayerStats and PlayerStats[playerId]
    if not cached then return false end
    local current = cached[field]
    if type(current) ~= "number" then current = 0 end
    cached[field] = current + value
    cached.dirty = true
    return true
end

---Sets a stat field. Updates cache only; persisted on player drop.
---@param playerId number
---@param field string
---@param value number|nil
---@return boolean
function SetPlayerStat(playerId, field, value)
    if field == 'money' or not ALLOWED_STAT_FIELDS[field] then return false end
    local cached = PlayerStats and PlayerStats[playerId]
    if not cached then return false end
    if value ~= nil and (field == "kills" or field == "deaths" or field == "damage" or field == "headshots" or field == "playtime" or field == "vehicles" or field == "properties") then
        if type(value) ~= "number" then return false end
    end
    cached[field] = value
    cached.dirty = true
    return true
end

exports('GetPlayerStats', GetPlayerStats)
exports('AddPlayerStat', AddPlayerStat)
exports('SetPlayerStat', SetPlayerStat)
exports('SaveAllPlayerStats', saveAllCachedPlayers)
exports('GetPodiumsForClient', GetPodiumsForClient)
exports('LoadProps', LoadProps)
exports('SaveProp', SaveProp)
exports('DeleteProp', DeleteProp)
exports('LoadPeds', LoadPeds)
exports('SavePed', SavePed)
exports('DeletePed', DeletePed)
