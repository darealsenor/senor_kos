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
    local player = QBCore.Functions.GetPlayer(playerId)
    if not player then return nil end
    local c = player.PlayerData.charinfo
    if not c or not c.firstname or not c.lastname then return nil end
    return ('%s %s'):format(c.firstname, c.lastname)
end

function framework.GetMoney(playerId)
    local player = QBCore.Functions.GetPlayer(playerId)
    if not player then return nil end
    local money = player.PlayerData.money
    if not money then return nil end
    return {
        cash = money.cash or 0,
        bank = money.bank or 0,
    }
end

function framework.GetVehicles(playerId)
    local player = QBCore.Functions.GetPlayer(playerId)
    if not player then return nil end
    local citizenid = player.PlayerData.citizenid
    if not citizenid then return nil end
    local count = MySQL.scalar.await('SELECT COUNT(*) FROM player_vehicles WHERE citizenid = ?', { citizenid })
    return count or 0
end

function framework.GetProperties(playerId)
    local player = QBCore.Functions.GetPlayer(playerId)
    if not player then return nil end
    local citizenid = player.PlayerData.citizenid
    if not citizenid then return nil end
    local count = MySQL.scalar.await('SELECT COUNT(*) FROM properties WHERE owner = ?', { citizenid })
    return count or 0
end

function framework.GetPlayerIdentifier(playerId)
    local player = QBCore.Functions.GetPlayer(playerId)
    if not player then return nil end
    local cid = player.PlayerData.citizenid
    return cid and tostring(cid) or nil
end

AddEventHandler('QBCore:Server:OnPlayerLoaded', function()
    TriggerEvent('senor_topplayers:playerLoaded', source)
end)

return framework
