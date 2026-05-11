local framework = {}

---@param playerId number
---@return boolean
function framework.IsAdmin(playerId)
    local adminConfig = Config.Admin and Config.Admin.default
    if not adminConfig or not adminConfig.permissions then
        return false
    end

    for i = 1, #adminConfig.permissions do
        if IsPlayerAceAllowed(playerId, adminConfig.permissions[i]) then
            return true
        end
    end

    return false
end

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

---@return number[]
function framework.GetPlayers()
    local output = {}
    local players = GetPlayers()
    for i = 1, #players do
        local playerId = tonumber(players[i])
        if playerId and playerId > 0 then
            output[#output + 1] = playerId
        end
    end
    return output
end

---@param playerId number
---@param bucket number|nil
---@return boolean
function framework.SetPlayerBucket(playerId, bucket)
    SetPlayerRoutingBucket(playerId, bucket or 0)
    return true
end

AddEventHandler('playerDropped', function()
    TriggerEvent(Events.SERVER_PLAYER_DROPPED, source)
end)

return framework
