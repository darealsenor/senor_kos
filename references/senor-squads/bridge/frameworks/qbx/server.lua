local framework = {}

---@param playerId string | number
---@return table|nil
function framework:GetPlayer(playerId)
    return exports.qbx_core:GetPlayer(playerId)
end

---@param playerId string | number
---@return string
function framework:GetPlayerName(playerId)
    local player = exports.qbx_core:GetPlayer(playerId)
    if not player then return 'SENOR' end
    return ("%s %s"):format(player.PlayerData.charinfo.firstname, player.PlayerData.charinfo.lastname)
end

---@param playerId string | number
---@return string
function framework:GetPlayerIdentifier(playerId)
    local player = exports.qbx_core:GetPlayer(playerId)
    if player then return player.PlayerData.citizenid end
    return GetPlayerIdentifierByType(tostring(playerId), 'license') or tostring(playerId)
end

---@return table[] array of { id: number, identifier: string }
function framework:GetAllPlayers()
    local result = {}
    local players = exports.qbx_core:GetQBPlayers()
    for id, player in pairs(players) do
        result[#result + 1] = { id = id, identifier = player.PlayerData.citizenid }
    end
    return result
end

RegisterNetEvent('QBCore:Server:OnPlayerLoaded', function()
    TriggerEvent('squads:server:playerLoaded', source)
end)

AddEventHandler('QBCore:Server:OnPlayerUnload', function(src)
    TriggerEvent('squads:server:playerDropped', src)
end)


return framework