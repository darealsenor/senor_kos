local framework = {}
local QBCore = exports['qb-core']:GetCoreObject()

function framework.IsAdmin(playerId)
    local adminConfig = Config.Admin and Config.Admin.qb
    if not adminConfig or not adminConfig.permissions then return false end
    for _, permission in ipairs(adminConfig.permissions) do
        if IsPlayerAceAllowed(playerId, permission) then return true end
    end
    return false
end

function framework.GetPlayerName(playerId)
    if ServerConfig.playerNameType ~= 'rp' then return GetPlayerName(playerId) end
    local player = QBCore.Functions.GetPlayer(playerId)
    if not player then return GetPlayerName(playerId) end
    return ('%s %s'):format(player.PlayerData.charinfo.firstname, player.PlayerData.charinfo.lastname)
end

function framework.SetPlayerBucket(playerId, bucket)
    return QBCore.Functions.SetPlayerBucket(playerId, bucket or 0)
end

function framework.AddMoney(playerId, amount, account)
    local Player = QBCore.Functions.GetPlayer(playerId)
    if not Player then return false end
    local acc = account or 'cash'
    return Player.Functions.AddMoney(acc, amount or 0, 'redzone-killstreak')
end

RegisterNetEvent('QBCore:Server:OnPlayerLoaded', function()
    TriggerEvent('redzone:server:playerLoaded', source)
end)

AddEventHandler('QBCore:Server:OnPlayerUnload', function()
    TriggerEvent('redzone:server:playerDropped', source)
end)

AddEventHandler('playerDropped', function()
    TriggerEvent('redzone:server:playerDropped', source)
end)

return framework
