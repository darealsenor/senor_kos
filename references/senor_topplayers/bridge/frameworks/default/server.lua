local framework = {}

function framework.IsAdmin(playerId)
    local adminConfig = Config.Admin and Config.Admin.default
    if not adminConfig or not adminConfig.permissions then return false end
    for _, permission in ipairs(adminConfig.permissions) do
        if IsPlayerAceAllowed(playerId, permission) then return true end
    end
    return false
end

function framework.GetPlayerName(playerId)
    return GetPlayerName(playerId) or ''
end

function framework.GetMoney(_playerId)
    return nil
end

function framework.GetVehicles(_playerId)
    return nil
end

function framework.GetProperties(_playerId)
    return nil
end

function framework.GetPlayerIdentifier(playerId)
    return GetPlayerIdentifierByType(playerId, 'license')
end

return framework
