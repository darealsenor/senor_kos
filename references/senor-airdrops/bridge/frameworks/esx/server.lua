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
    local adminConfig = Config.Admin.esx
    if not adminConfig or not adminConfig.permissions then return false end
    
    for _, permission in ipairs(adminConfig.permissions) do
        if IsPlayerAceAllowed(playerId, permission) then
            return true
        end
    end
    
    return false
end

function framework.IsDead(playerId)
    local xPlayer = ESX.GetPlayerFromId(playerId)
    if not xPlayer then return false end
    return xPlayer.get('isDead') == true or xPlayer.get('dead') == true
end

AddEventHandler('esx:playerDropped', function(playerId, ...)
    TriggerEvent('airdrops:server:playerDropped', playerId, ...)
end)

AddEventHandler('esx:playerLogout', function(playerId, ...)
    TriggerEvent('airdrops:server:playerDropped', playerId, ...)
end)


return framework
