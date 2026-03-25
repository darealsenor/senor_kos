local framework = {}

---@param playerId number
---@return string|nil
function framework.GetPlayerIdentifier(playerId)
    return GetPlayerIdentifierByType(playerId, 'license')
end

---@param playerId number
---@return string
function framework.GetPlayerName(playerId)
    return GetPlayerName(playerId) or ''
end

---@param _playerId number
---@return string|nil
function framework.GetGangName(_playerId)
    return nil
end

return framework
