local framework = {}
local Ox = exports["ox_core"]

function framework.IsAdmin(playerId)
    if IsAdmin and IsAdmin(playerId) then
            return true
    end
    
    return false
end

function framework.GetPlayer(playerId)
    return Ox.GetPlayer(playerId)
end

function framework.GetPlayerName(playerId)
    local Player = Ox.GetPlayer(playerId)
    if not Player then return GetPlayerName(playerId) or "Unknown" end
    local firstName = Player.get("firstName") or ""
    local lastName = Player.get("lastName") or ""
    local fullName = (firstName .. " " .. lastName):gsub("^%s+", ""):gsub("%s+$", "")
    if fullName and fullName ~= "" then
        return fullName
    end
    return GetPlayerName(playerId) or "Unknown"
end

function framework.GetGangs()
    return {}
end

AddEventHandler('_playerLoaded', function(...)
    local src = source
    TriggerEvent('senor-chat:playerLoaded', src)
end)

AddEventHandler('_playerDropped', function(...)
    local src = source
    TriggerEvent('senor-chat:playerDropped', src)
end)

AddEventHandler('playerDropped', function ()
   local src = source
   TriggerEvent('senor-chat:playerDropped', src)
end)

return framework