AddEventHandler('senor_topplayers:playerLoaded', function(playerId)
    local isNew = loadPlayerIntoCache(playerId)
    local avatar = Avatar.Get(playerId)
    if avatar then
        SetPlayerAvatar(playerId, avatar)
    end
    if isNew then
        CreateThread(function()
            Wait(0)
            savePlayerToDb(playerId, false)
        end)
    end
    TriggerClientEvent('senor_topplayers:client:setPodiums', playerId, GetCachedPodiums())
end)

AddEventHandler('onServerResourceStart', function(resName)
    if resName ~= GetCurrentResourceName() then return end
    CreateThread(function()
        Wait(1000)
        for _, id in ipairs(GetPlayers()) do
            local playerId = tonumber(id)
            if playerId then
                TriggerEvent('senor_topplayers:playerLoaded', playerId)
            end
        end
    end)
end)

AddEventHandler('senor_topplayers:playerDropped', function(playerId)
    savePlayerToDb(playerId, true)
end)

AddEventHandler('playerDropped', function()
    local src = source
    TriggerEvent('senor_topplayers:playerDropped', src)
end)
