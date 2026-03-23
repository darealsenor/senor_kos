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
    if ServerConfig.playerNameType ~= 'rp' then return GetPlayerName(playerId) end
    local xPlayer = ESX.GetPlayerFromId(playerId)
    if not xPlayer then return GetPlayerName(playerId) end
    return xPlayer.getName()
end

function framework.SetPlayerBucket(playerId, bucket)
    SetPlayerRoutingBucket(playerId, bucket or 0)
    return true
end

function framework.AddMoney(playerId, amount, account)
    local xPlayer = ESX.GetPlayerFromId(playerId)
    if not xPlayer then return false end
    local amt = amount or 0
    local acc = account or 'cash'
    if acc == 'cash' or acc == 'money' then
        xPlayer.addMoney(amt)
        return true
    end
    xPlayer.addAccountMoney(acc, amt)
    return true
end

AddEventHandler('esx:playerLoaded', function(playerId)
    TriggerEvent('redzone:server:playerLoaded', playerId)
end)

AddEventHandler('esx:playerDropped', function(playerId)
    TriggerEvent('redzone:server:playerDropped', playerId)
end)

AddEventHandler('esx:playerLogout', function(playerId)
    TriggerEvent('redzone:server:playerDropped', playerId)
end)

return framework
