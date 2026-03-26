local framework = {}
local QBX = exports.qbx_core

---@param playerId number
---@return boolean
function framework.IsAdmin(playerId)
    local adminConfig = Config.Admin and Config.Admin.qbx
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
    local player = QBX:GetPlayer(playerId)
    if not player then
        return nil
    end
    local citizenId = player.PlayerData and player.PlayerData.citizenid
    return citizenId and tostring(citizenId) or nil
end

---@param playerId number
---@return string
function framework.GetPlayerName(playerId)
    local player = QBX:GetPlayer(playerId)
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
    local player = QBX:GetPlayer(playerId)
    if not player then
        return nil
    end
    local gang = player.PlayerData and player.PlayerData.gang
    if not gang then
        return nil
    end
    return gang.name or gang.label
end

AddEventHandler('qbx_core:server:playerLoggedOut', function(playerId)
    TriggerEvent(Events.SERVER_PLAYER_DROPPED, tonumber(playerId) or source)
end)

AddEventHandler('QBCore:Server:OnPlayerUnload', function()
    TriggerEvent(Events.SERVER_PLAYER_DROPPED, source)
end)

AddEventHandler('playerDropped', function()
    TriggerEvent(Events.SERVER_PLAYER_DROPPED, source)
end)

return framework
