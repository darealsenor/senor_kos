local framework = {}
local ESX = exports['es_extended']:getSharedObject()

---@param playerId number
---@return boolean
function framework.IsAdmin(playerId)
    local adminConfig = Config.Admin and Config.Admin.esx
    if not adminConfig then
        return false
    end

    local player = ESX.GetPlayerFromId(playerId)
    if player and adminConfig.groups then
        local group = player.getGroup and player.getGroup() or nil
        for i = 1, #adminConfig.groups do
            if group == adminConfig.groups[i] then
                return true
            end
        end
    end

    if adminConfig.permissions then
        for i = 1, #adminConfig.permissions do
            if IsPlayerAceAllowed(playerId, adminConfig.permissions[i]) then
                return true
            end
        end
    end

    return false
end

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

---@return number[]
function framework.GetPlayers()
    local output = {}
    local players = ESX.GetExtendedPlayers() or {}
    for i = 1, #players do
        local player = players[i]
        local id = player and tonumber(player.source)
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
    SetPlayerRoutingBucket(playerId, bucket or 0)
    return true
end

AddEventHandler('esx:playerLoaded', function(playerId)
    TriggerEvent(Events.SERVER_PLAYER_LOADED, playerId)
end)

AddEventHandler('esx:playerDropped', function(playerId)
    TriggerEvent(Events.SERVER_PLAYER_DROPPED, playerId)
end)

AddEventHandler('esx:playerLogout', function(playerId)
    TriggerEvent(Events.SERVER_PLAYER_DROPPED, playerId)
end)

return framework
