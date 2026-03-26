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

---@param _playerId number
---@return string|nil
function framework.GetGangName(_playerId)
    return nil
end

AddEventHandler('playerDropped', function()
    TriggerEvent(Events.SERVER_PLAYER_DROPPED, source)
end)

return framework
