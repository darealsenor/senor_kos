local framework = {}

function framework.IsAdmin(playerId)
    local adminConfig = Config.Admin and Config.Admin.ox
    if not adminConfig or not adminConfig.permissions then return false end
    for _, permission in ipairs(adminConfig.permissions) do
        if IsPlayerAceAllowed(playerId, permission) then return true end
    end
    return false
end

function framework.GetPlayerName(playerId)
    if ServerConfig.playerNameType ~= 'rp' then return GetPlayerName(playerId) end
    local player = exports.ox_core:GetPlayer(playerId)
    if not player then return GetPlayerName(playerId) end
    return player.username
end

function framework.SetPlayerBucket(playerId, bucket)
    SetPlayerRoutingBucket(playerId, bucket or 0)
    return true
end

function framework.AddMoney(playerId, amount, account)
    if GetResourceState('ox_inventory'):find('start') then
        return exports.ox_inventory:AddItem(playerId, 'money', amount or 0)
    end
    return false
end

AddEventHandler('_playerLoaded', function()
    TriggerEvent('redzone:server:playerLoaded', source)
end)

AddEventHandler('_playerDropped', function()
    TriggerEvent('redzone:server:playerDropped', source)
end)

AddEventHandler('playerDropped', function()
    TriggerEvent('redzone:server:playerDropped', source)
end)

return framework
