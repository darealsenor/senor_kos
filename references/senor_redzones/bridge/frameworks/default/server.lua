local framework = {}

function framework.IsAdmin(playerId)
    local adminConfig = Config.Admin and Config.Admin.default
    if not adminConfig or not adminConfig.permissions then return false end
    for _, permission in ipairs(adminConfig.permissions) do
        if IsPlayerAceAllowed(playerId, permission) then return true end
    end
    return false
end

function framework.SetPlayerBucket(playerId, bucket)
    SetPlayerRoutingBucket(playerId, bucket or 0)
    return true
end

function framework.GetPlayerName(playerId)
    return GetPlayerName(playerId)
end

function framework.AddMoney(_playerId, _amount, _account)
    return false
end

AddEventHandler('playerDropped', function()
    TriggerEvent('redzone:server:playerDropped', source)
end)

return framework
