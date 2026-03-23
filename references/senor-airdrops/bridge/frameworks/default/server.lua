local framework = {}

function framework.GetPlayer(playerId)
    return {
        PlayerData = {}
    }
end

function framework.GetPlayerName(playerId)
    return GetPlayerName(playerId) or "Unknown"
end

function framework.IsAdmin(playerId)
    local adminConfig = Config.Admin.default
    if not adminConfig or not adminConfig.permissions then return false end
    
    for _, permission in ipairs(adminConfig.permissions) do
        if IsPlayerAceAllowed(playerId, permission) then
            return true
        end
    end
    
    return false
end

function framework.IsDead(playerId)
    local ped = GetPlayerPed(playerId)
    if not ped or ped == 0 then return false end
    return IsEntityDead(ped) or GetEntityHealth(ped) <= 0
end

AddEventHandler('playerDropped', function()
    local src = source
    TriggerEvent('airdrops:server:playerDropped', src)
end)

return framework

