local framework = {}
local ESX = exports["es_extended"]:getSharedObject()

function framework.GetPlayer()
    local player = ESX.PlayerData
    return {
        fullName = ("%s %s"):format(player.firstName, player.lastName),
        firstName = player.firstName,
        lastName = player.lastName,
        dob = player.dateofbirth,
        gender = player.sex
    }
end

function framework.GetMoney(type)
    local player = ESX.PlayerData
    if type == "cash" then
        return player.accounts.Money
    elseif type == "bank" then
        return player.accounts.Bank
    elseif type == "black" then
        return player.accounts.Black
    end
end

function framework.GetJobInfo()
    local player = ESX.PlayerData
    return {
        grade = player.job.grade,
        gradeName = player.job.grade_name,
        jobName = player.job.name,
        jobLabel = player.job.label
    }
end

function framework.IsPlayerLoaded()
    return ESX.IsPlayerLoaded()
end

function framework.IsDead()
    local playerPed = PlayerPedId()
    return IsEntityDead(playerPed) or GetEntityHealth(playerPed) <= 0 or (ESX.PlayerData and ESX.PlayerData.dead == true)
end

RegisterNetEvent('esx:playerLoaded', function(xPlayer, skin)
    TriggerEvent('airdrops:client:playerLoaded')
end)

RegisterNetEvent('esx:onPlayerLogout', function()
    TriggerEvent('airdrops:client:playerUnloaded')
end)

return framework
