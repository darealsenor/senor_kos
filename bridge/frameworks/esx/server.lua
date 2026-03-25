local framework = {}
local ESX = exports['es_extended']:getSharedObject()

---@param playerId number
---@return string|nil
function framework.GetPlayerIdentifier(playerId)
    local player = ESX.GetPlayerFromId(playerId)
    if not player then
        return nil
    end
    local identifier = player.identifier
    return identifier and tostring(identifier) or nil
end

---@param playerId number
---@return string
function framework.GetPlayerName(playerId)
    local player = ESX.GetPlayerFromId(playerId)
    if not player then
        return GetPlayerName(playerId) or ''
    end
    return player.getName() or GetPlayerName(playerId) or ''
end

---@param _playerId number
---@return string|nil
function framework.GetGangName(_playerId)
    return nil
end

return framework
