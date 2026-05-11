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

---@return number[]
function framework.GetPlayers()
    local output = {}
    local players = exports.qbx_core:GetQBPlayers() or {}
    for playerId, _player in pairs(players) do
        local id = tonumber(playerId)
        if id and id > 0 then
            output[#output + 1] = id
        end
    end
    return output
end

---@param playerId number
---@param bucket number|nil
---@return boolean
function framework.SetPlayerBucket(playerId, bucket)
    return exports.qbx_core:SetPlayerBucket(playerId, bucket or 0)
end

RegisterNetEvent('QBCore:Server:OnPlayerLoaded', function()
    TriggerEvent(Events.SERVER_PLAYER_LOADED, source)
end)

AddEventHandler('QBCore:Server:PlayerLoaded', function(player)
    local playerId = player and player.PlayerData and player.PlayerData.source or source
    TriggerEvent(Events.SERVER_PLAYER_LOADED, playerId)
end)

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
