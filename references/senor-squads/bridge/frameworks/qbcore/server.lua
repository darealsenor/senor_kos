local framework = {}
local QBCore = exports["qb-core"]:GetCoreObject()

---@param playerId string | number
---@return string
function framework:GetPlayer(playerId)
    return QBCore.Functions.GetPlayer(playerId)
end

---@param playerId string | number
---@return string
function framework:GetPlayerName(playerId)
    local Player = QBCore.Functions.GetPlayer(playerId)
    if not Player then return 'SENOR' end
    return ("%s %s"):format(Player.PlayerData.charinfo.firstname, Player.PlayerData.charinfo.lastname)
end

---@param playerId string | number
---@return string
function framework:GetPlayerIdentifier(playerId)
    local Player = QBCore.Functions.GetPlayer(playerId)
    if Player then return Player.PlayerData.citizenid end
    return GetPlayerIdentifierByType(tostring(playerId), 'license') or tostring(playerId)
end

---@return table[] array of { id: number, identifier: string }
function framework:GetAllPlayers()
    local result = {}
    local players = QBCore.Functions.GetQBPlayers()
    for id, player in pairs(players) do
        result[#result + 1] = { id = id, identifier = player.PlayerData.citizenid }
    end
    return result
end

AddEventHandler('QBCore:Server:OnPlayerLoaded', function(...)
    local src = source
    TriggerEvent('squads:server:playerLoaded', src, ...)
end)

AddEventHandler('QBCore:Server:PlayerDropped', function(...)
    local src = source
    TriggerEvent('squads:server:playerDropped', src, ...)
end)

AddEventHandler('QBCore:Server:OnPlayerUnload', function(...)
    TriggerEvent('squads:server:playerDropped', ...)
end)

AddEventHandler('playerDropped', function ()
   local src = source
   TriggerEvent('squads:server:playerDropped', src)
end)


return framework