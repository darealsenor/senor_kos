require("@qbx_core/modules/playerdata")
local framework = {}
local qbx_core = exports.qbx_core

local cashAmount = QBX.PlayerData.money.cash or 0
local bankAmount = QBX.PlayerData.money.bank or 0

RegisterNetEvent('hud:client:OnMoneyChange', function(type, amount, isMinus)
    cashAmount = QBX.PlayerData.money.cash
    bankAmount = QBX.PlayerData.money.bank
end)

function framework.GetPlayer()
    local player = QBX.PlayerData?.charinfo
    local firstName = player.firstname
    local lastName = player.lastname
    return {
        fullName = ("%s %s"):format(firstName, lastName),
        firstName = firstName,
        lastName = lastName,
        dob = player.birthdate,
        gender = player.gender
    }
end

function framework.GetMoney(type)
    if type == "cash" then
        return cashAmount
    elseif type == "bank" then
        return bankAmount
    elseif type == "black" then
        if GetResourceState("ox_inventory"):find("start") then
            local ox_inventory <const> = exports.ox_inventory
            local usingDirtyMoney <const> = ox_inventory:Items("black_money")
            return ox_inventory:GetItemCount("black_money")
        end
        
        return cashAmount
    end
end

function framework.GetJobInfo()
    local player = QBX.PlayerData
    local job = player.job
    return {
        grade = job.grade.level,
        gradeName = job.grade.name,
        jobName = job.name,
        jobLabel = player.job.label
    }
end

function framework.IsPlayerLoaded()
    return QBX.PlayerData ~= nil
end

function framework.IsDead()
    local player = QBX.PlayerData
    if not player or not player.metadata then return false end
    return player.metadata.isdead == true or player.metadata.inlaststand == true
end

AddEventHandler('QBCore:Client:OnPlayerLoaded', function()
    TriggerEvent('airdrops:client:playerLoaded')
end)

AddEventHandler('QBCore:Client:OnPlayerUnload', function()
    TriggerEvent('airdrops:client:playerUnloaded')
end)


return framework
