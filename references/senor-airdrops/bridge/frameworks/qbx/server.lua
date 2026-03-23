local framework = {}
local QBX = exports.qbx_core

function framework.IsAdmin(playerId)
    local adminConfig = Config.Admin.qbx
    if not adminConfig or not adminConfig.permissions then return false end
    
    for _, permission in ipairs(adminConfig.permissions) do
        if IsPlayerAceAllowed(playerId, permission) then
            return true
        end
    end
    
    return false
end

function framework.IsDead(playerId)
    local Player = QBX:GetPlayer(playerId)
    if not Player then return false end
    return Player.PlayerData.metadata.isdead == true or Player.PlayerData.metadata.inlaststand == true
end

function framework.GetPlayer(playerId)
    return QBX:GetPlayer(playerId)
end

function framework.GetPlayerName(playerId)
    local Player = QBX:GetPlayer(playerId)
    if not Player then return GetPlayerName(playerId) or "Unknown" end
    local charinfo = Player.PlayerData.charinfo
    if charinfo and charinfo.firstname and charinfo.lastname then
        return charinfo.firstname .. " " .. charinfo.lastname
    end
    return GetPlayerName(playerId) or "Unknown"
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

AddEventHandler('playerDropped', function()
    local src = source
    TriggerEvent('airdrops:server:playerDropped', src)
end)

return framework
