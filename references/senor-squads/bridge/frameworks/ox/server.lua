local framework = {}
local Ox = exports["ox_core"]

---@param playerId string | number
---@return string
function framework:GetPlayer(playerId)
    return Ox:GetPlayer(playerId)
end

---@param playerId string | number
---@return string
function framework:GetPlayerName(playerId)
    local Player = OX:GetPlayer(playerId)
    if not Player then return 'SENOR' end
    return ("%s"):format(Player.username)
end

---@param playerId string | number
---@return string
function framework:GetPlayerIdentifier(playerId)
    local Player = Ox:GetPlayer(playerId)
    if Player then return Player.identifier end
    return GetPlayerIdentifierByType(tostring(playerId), 'license') or tostring(playerId)
end

---@return table[] array of { id: number, identifier: string }
function framework:GetAllPlayers()
    local result = {}
    local players = Ox:GetPlayers()
    for _, player in ipairs(players) do
        result[#result + 1] = { id = player.source, identifier = player.identifier }
    end
    return result
end

AddEventHandler('_playerLoaded', function(...)
    local src = source
    TriggerEvent('squads:server:playerLoaded', src, ...)
end)


AddEventHandler('_playerDropped', function(...)
    TriggerEvent('squads:server:playerDropped', ...)
end)

AddEventHandler('playerDropped', function ()
   local src = source
   TriggerEvent('squads:server:playerDropped', src)
end)


return framework