local framework = {}

function framework.GetPlayer()
    local name = GetPlayerName(cache.playerId)
    return {
        fullName = name,
        firstName = name,
        lastName = "",
        dob = "",
        gender = 0
    }
end

function framework.GetMoney(type)
    return 0
end

function framework.GetJobInfo()
    return {
        grade = 0,
        gradeName = "",
        jobName = "unemployed",
        jobLabel = "Unemployed"
    }
end

function framework.IsPlayerLoaded()
    return NetworkIsPlayerActive(PlayerId())
end

function framework.IsDead()
    local playerPed = PlayerPedId()
    return IsEntityDead(playerPed) or GetEntityHealth(playerPed) <= 0
end

AddEventHandler('playerSpawned', function()
    TriggerEvent('airdrops:client:playerLoaded')
end)

AddEventHandler('onResourceStop', function(resourceName)
    if resourceName == GetCurrentResourceName() then
        TriggerEvent('airdrops:client:playerUnloaded')
    end
end)

return framework

