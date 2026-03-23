local framework = {}
local ESX = exports['es_extended']:getSharedObject()

function framework.IsAdmin(playerId)
    local adminConfig = Config.Admin and Config.Admin.esx
    if not adminConfig then return false end
    local xPlayer = ESX.GetPlayerFromId(playerId)
    if not xPlayer then return false end
    if adminConfig.groups then
        local playerGroup = xPlayer.getGroup()
        for _, group in ipairs(adminConfig.groups) do
            if playerGroup == group then return true end
        end
    end
    if adminConfig.permissions then
        for _, permission in ipairs(adminConfig.permissions) do
            if IsPlayerAceAllowed(playerId, permission) then return true end
        end
    end
    return false
end

function framework.GetPlayerName(playerId)
    local xPlayer = ESX.GetPlayerFromId(playerId)
    if not xPlayer then return nil end
    return xPlayer.getName()
end

function framework.GetMoney(playerId)
    local xPlayer = ESX.GetPlayerFromId(playerId)
    if not xPlayer then return nil end
    local cash = xPlayer.getMoney()
    local bank = 0
    local acc = xPlayer.getAccount('bank')
    if acc then
        bank = acc.money or 0
    end
    return {
        cash = cash or 0,
        bank = bank,
    }
end

function framework.GetVehicles(playerId)
    local xPlayer = ESX.GetPlayerFromId(playerId)
    if not xPlayer then return nil end
    local identifier = xPlayer.identifier
    if not identifier then return nil end
    local count = MySQL.scalar.await('SELECT COUNT(*) FROM owned_vehicles WHERE owner = ?', { identifier })
    return count or 0
end

function framework.GetProperties(playerId)
    return 0
end

function framework.GetPlayerIdentifier(playerId)
    local xPlayer = ESX.GetPlayerFromId(playerId)
    if not xPlayer then return nil end
    local id = xPlayer.identifier
    return id and tostring(id) or nil
end

AddEventHandler('esx:playerLoaded', function(playerId)
    TriggerEvent('senor_topplayers:playerLoaded', playerId)
end)

return framework
