local framework = {}
local ESX = exports["es_extended"]:getSharedObject()


---@param playerId string | number
---@return string
function framework:GetPlayer(playerId)
    return ESX.GetPlayerFromId(playerId)
end

---@param playerId string | number
---@return string
function framework:GetPlayerName(playerId)
    local Player = ESX.GetPlayerFromId(playerId)
    if not Player then return 'SENOR' end
    return Player.getName()
end

---@param playerId string | number
---@return string
function framework:GetPlayerIdentifier(playerId)
    local Player = ESX.GetPlayerFromId(playerId)
    if Player then return Player.identifier end
    return GetPlayerIdentifierByType(tostring(playerId), 'license') or tostring(playerId)
end

---@return table[] array of { id: number, identifier: string }
function framework:GetAllPlayers()
    local result = {}
    local players = ESX.GetExtendedPlayers()
    for _, xPlayer in ipairs(players) do
        result[#result + 1] = { id = xPlayer.source, identifier = xPlayer.identifier }
    end
    return result
end

AddEventHandler('esx:playerDropped', function(playerId, ...)
    TriggerEvent('squads:server:playerDropped', playerId, ...)
end)

AddEventHandler('esx:playerLogout', function (playerId, ...)
    TriggerEvent('squads:server:playerDropped', playerId, ...)
end)




return framework