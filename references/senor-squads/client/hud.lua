function ToggleHudThread(bool)
    if not Config.Settings['Hud'] then return end
    if not bool then return end
    if Squad.Settings.Hud and Squad.mySquad and Squad.mySquad.players and #Squad.mySquad.players then
        local playersDict = {}
        for _, player in ipairs(Squad.mySquad.players) do
            if player and player.serverId then
                playersDict[player.serverId] = player
            end
        end
        SendReactMessage('updatePlayers', playersDict)
    end
end

local function findPlayerByServerId(playerId)
    if not Squad.mySquad or not Squad.mySquad.players then
        return nil
    end
    
    for i, player in ipairs(Squad.mySquad.players) do
        if player.serverId == playerId then
            return i, player
        end
    end
    
    return nil, nil
end

local function isPlayerInSquad(playerId)
    local index, player = findPlayerByServerId(playerId)
    return player ~= nil
end

local function setTalkingState(playerId, state)
    local index, player = findPlayerByServerId(playerId)
    if not player then
        return nil
    end
    player.talking = state
    Squad.mySquad.players[index].talking = state
    return player
end

RegisterNetEvent('pma-voice:radioActive')
AddEventHandler('pma-voice:radioActive', function(talkingState)
    if not Squad.Settings.ShowRadioIcon then return end
    if not Squad.mySquad or not Squad.mySquad.players then return end
    if not isPlayerInSquad(cache.serverId) then return end
    local talking = talkingState and true or false
    local player = setTalkingState(cache.serverId, talking)
    if player then
        SendReactMessage('updatePlayer', { serverId = cache.serverId, data = { talking = talking } })
    end
end)

RegisterNetEvent('pma-voice:setTalkingOnRadio')
AddEventHandler('pma-voice:setTalkingOnRadio', function(source, talkingState)
    if not Squad.Settings.ShowRadioIcon then return end
    if not Squad.mySquad or not Squad.mySquad.players then return end
    if isPlayerInSquad(source) then
        local talking = talkingState and true or false
        local player = setTalkingState(source, talking)
        if player then
            SendReactMessage('updatePlayer', { serverId = source, data = { talking = talking } })
        end
    end
end)
