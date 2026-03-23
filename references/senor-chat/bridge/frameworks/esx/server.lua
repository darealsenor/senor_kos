local framework = {}
local ESX = exports["es_extended"]:getSharedObject()

function framework.GetPlayer(playerId)
    return ESX.GetPlayerFromId(playerId)
end

function framework.GetPlayerName(playerId)
    local Player = ESX.GetPlayerFromId(playerId)
    if not Player then return GetPlayerName(playerId) or "Unknown" end
    return Player.getName()
end

function framework.IsAdmin(playerId)
    if IsAdmin and IsAdmin(playerId) then
            return true
    end
    
    return false
end

function framework.GetGangs()
    return {}
end

AddEventHandler('esx:playerDropped', function(playerId, ...)
    TriggerEvent('senor-chat:playerDropped', playerId)
end)

AddEventHandler('esx:playerLogout', function(playerId, ...)
    TriggerEvent('senor-chat:playerDropped', playerId)
end)

AddEventHandler('esx:playerLoaded', function(playerId, ...)
    TriggerEvent('senor-chat:playerLoaded', playerId)
end)


return framework
