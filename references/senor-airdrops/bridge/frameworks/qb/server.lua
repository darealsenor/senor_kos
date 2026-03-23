local framework = {}
local QBCore = exports["qb-core"]:GetCoreObject()

function framework.IsAdmin(playerId)
    local adminConfig = Config.Admin.qb
    if not adminConfig or not adminConfig.permissions then return false end
    
    for _, permission in ipairs(adminConfig.permissions) do
        if IsPlayerAceAllowed(playerId, permission) then
            return true
        end
    end
    
    return false
end

function framework.IsDead(playerId)
    local Player = QBCore.Functions.GetPlayer(playerId)
    if not Player then return false end
    return Player.PlayerData.metadata.isdead == true or Player.PlayerData.metadata.inlaststand == true
end

function framework.GetPlayer(playerId)
    return QBCore.Functions.GetPlayer(playerId)
end

function framework.GetPlayerName(playerId)
    local Player = QBCore.Functions.GetPlayer(playerId)
    if not Player then return GetPlayerName(playerId) or "Unknown" end
    return Player.PlayerData.charinfo.firstname .. " " .. Player.PlayerData.charinfo.lastname
end

AddEventHandler('QBCore:Server:OnPlayerLoaded', function(...)
    local src = source
    TriggerEvent('airdrops:server:playerLoaded', src, ...)
end)

AddEventHandler('QBCore:Server:PlayerDropped', function(...)
    local src = source
    TriggerEvent('airdrops:server:playerDropped', src, ...)
end)

AddEventHandler('QBCore:Server:OnPlayerUnload', function(...)
    TriggerEvent('airdrops:server:playerDropped', ...)
end)

AddEventHandler('playerDropped', function ()
   local src = source
   TriggerEvent('airdrops:server:playerDropped', src)
end)

return framework