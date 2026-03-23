local framework = {}
local Ox = exports["ox_core"]

function framework.IsAdmin(playerId)
    local adminConfig = Config.Admin.ox
    if not adminConfig or not adminConfig.permissions then return false end
    
    for _, permission in ipairs(adminConfig.permissions) do
        if IsPlayerAceAllowed(playerId, permission) then
            return true
        end
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

function framework.IsDead(playerId)
    local Player = Ox.GetPlayer(playerId)
    if not Player then return false end
    return Player.state.isDead == true or Player.state.inLastStand == true or Player.state.cDead == true
end

AddEventHandler('_playerLoaded', function(...)
    local src = source
    TriggerEvent('airdrops:server:playerLoaded', src, ...)
end)


AddEventHandler('_playerDropped', function(...)
    TriggerEvent('airdrops:server:playerDropped', ...)
end)

AddEventHandler('playerDropped', function ()
   local src = source
   TriggerEvent('airdrops:server:playerDropped', src)
end)

return framework