local Ox = require '@ox_core.lib.init'
local framework = {}

---@param playerId number
---@return string|nil
function framework.GetPlayerIdentifier(playerId)
    local player = Ox.GetPlayer(playerId)
    if not player then
        return nil
    end
    local charId = player.charId
    return charId and tostring(charId) or nil
end

---@param playerId number
---@return string
function framework.GetPlayerName(playerId)
    local player = Ox.GetPlayer(playerId)
    if not player then
        return GetPlayerName(playerId) or ''
    end
    local first = player.get('firstName')
    local last = player.get('lastName')
    if first and last then
        return ('%s %s'):format(first, last)
    end
    return player.username or GetPlayerName(playerId) or ''
end

---@param _playerId number
---@return string|nil
function framework.GetGangName(_playerId)
    return nil
end

return framework
