local framework = {}

---@param playerId string | number
---@return string
function framework:GetPlayer(playerId)
    return 'Name' -- your logic here
end

---@param playerId string | number
---@return string
function framework:GetPlayerName(playerId)
    return GetPlayerName(playerId) -- your logic here
end

---@param playerId string | number
---@return string
function framework:GetPlayerIdentifier(playerId)
    return GetPlayerIdentifierByType(tostring(playerId), 'license') or tostring(playerId)
end

---@return table[] array of { id: number, identifier: string }
function framework:GetAllPlayers()
    local result = {}
    for _, pid in ipairs(GetPlayers()) do
        local id = tonumber(pid)
        result[#result + 1] = { id = id, identifier = GetPlayerIdentifierByType(tostring(id), 'license') or tostring(id) }
    end
    return result
end

AddEventHandler('Loaded', function(...)
    local src = source
    TriggerEvent('squads:server:playerLoaded', src, ...) -- your logic here
end)

AddEventHandler('playerDropped', function(...)
    local src = source
    TriggerEvent('squads:server:playerDropped', src, ...) -- your logic here
end)

AddEventHandler('Unload', function(...)
    TriggerEvent('squads:server:playerDropped', ...) -- your logic here
end)


return framework