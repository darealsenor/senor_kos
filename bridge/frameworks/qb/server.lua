local framework = {}
local QBCore = exports['qb-core']:GetCoreObject()

---@param playerId number
---@return string|nil
function framework.GetPlayerIdentifier(playerId)
    local player = QBCore.Functions.GetPlayer(playerId)
    if not player then
        return nil
    end
    local citizenId = player.PlayerData and player.PlayerData.citizenid
    return citizenId and tostring(citizenId) or nil
end

---@param playerId number
---@return string
function framework.GetPlayerName(playerId)
    local player = QBCore.Functions.GetPlayer(playerId)
    if not player then
        return GetPlayerName(playerId) or ''
    end
    local c = player.PlayerData and player.PlayerData.charinfo
    if c and c.firstname and c.lastname then
        return ('%s %s'):format(c.firstname, c.lastname)
    end
    return GetPlayerName(playerId) or ''
end

---@param playerId number
---@return string|nil
function framework.GetGangName(playerId)
    local player = QBCore.Functions.GetPlayer(playerId)
    if not player then
        return nil
    end
    local gang = player.PlayerData and player.PlayerData.gang
    if not gang then
        return nil
    end
    return gang.name or gang.label
end

return framework
