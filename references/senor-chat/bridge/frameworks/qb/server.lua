local framework = {}
local QBCore = exports["qb-core"]:GetCoreObject()

function framework.IsAdmin(playerId)
    if IsAdmin and IsAdmin(playerId) then
            return true
    end
    
    return false
end

function framework.GetPlayer(playerId)
    return QBCore.Functions.GetPlayer(playerId)
end

function framework.GetPlayerName(playerId)
    local Player = QBCore.Functions.GetPlayer(playerId)
    if not Player then return GetPlayerName(playerId) or "Unknown" end
    return Player.PlayerData.charinfo.firstname .. " " .. Player.PlayerData.charinfo.lastname
end

function framework.GetGangs()
    return QBCore.Shared.Gangs or {}
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

AddEventHandler('playerDropped', function ()
   local src = source
   TriggerEvent('senor-chat:playerDropped', src)
end)

return framework