local framework = {}
local QBCore = exports["qb-core"]:GetCoreObject()

function framework.GetPlayer()
    local player = QBCore.Functions.GetPlayerData()
    local info = player.charinfo
    local lastName = info.lastname
    local firstName = info.firstname
    return {
        fullName = ("%s %s"):format(firstName, lastName),
        firstName = player.firstname,
        lastName = player.lastname,
        dob = info.birthdate,
        gender = info.gender
    }
end

function framework.GetMoney(type)
    local player = QBCore.Functions.GetPlayerData()
    if type == "cash" then
        return player.money["cash"]
    elseif type == "bank" then
        return player.money["bank"]
    elseif type == "black" then
        return player.money["cash"] -- note: need to figure this out.
    end
end

function framework.GetJobInfo()
    local player = QBCore.Functions.GetPlayerData()
    local job = player.job
    return {
        grade = job.grade.level,
        gradeName = job.grade.name,
        jobName = job.name,
        jobLabel = job.label
    }
end

function framework.IsPlayerLoaded()
    return QBCore.Functions.GetPlayerData() ~= nil
end

function framework.IsDead()
    local player = QBCore.Functions.GetPlayerData()
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
