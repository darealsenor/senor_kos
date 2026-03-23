local framework = {}
local QBX = exports.qbx_core

function framework.IsAdmin(playerId)
    if IsAdmin and IsAdmin(playerId) then
            return true
    end
    
    return false
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

function framework.GetGangs()
    return QBX.Shared.Gangs or {}
end

RegisterNetEvent('QBCore:Server:OnPlayerLoaded')
AddEventHandler('QBCore:Server:OnPlayerLoaded', function(...)
    local src = source
    TriggerEvent('senor-chat:playerLoaded', src)
end)

RegisterNetEvent('QBCore:Server:PlayerDropped')
AddEventHandler('QBCore:Server:PlayerDropped', function(...)
    local src = source
    TriggerEvent('senor-chat:playerDropped', src)
end)

RegisterNetEvent('QBCore:Server:OnPlayerUnload')
AddEventHandler('QBCore:Server:OnPlayerUnload', function(...)
    local src = source
    TriggerEvent('senor-chat:playerDropped', src)
end)

AddEventHandler('playerDropped', function()
    local src = source
    TriggerEvent('senor-chat:playerDropped', src)
end)

return framework
