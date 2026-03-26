KOSState = {
    inMatch = false,
    matchId = nil,
    matchData = nil,
}

---@param data table|nil
function KOSState.setMatchData(data)
    KOSState.matchData = data
    local mid = data and data.match and data.match.id
    if mid then
        KOSState.matchId = mid
        KOSState.inMatch = true
    else
        KOSState.matchId = nil
        KOSState.inMatch = false
    end
    TriggerEvent(Events.CLIENT_STATE_UPDATED, KOSState.getSnapshot())
end

function KOSState.clear()
    KOSState.inMatch = false
    KOSState.matchId = nil
    KOSState.matchData = nil
    TriggerEvent(Events.CLIENT_STATE_UPDATED, KOSState.getSnapshot())
end


---@param aliveOnly boolean|nil
---@return string|nil, table
function KOSState.getMyTeam(aliveOnly)
    if not KOSState.matchData then
        return nil, {}
    end
    local myId = cache.serverId
    local players = KOSState.matchData.players
    local myTeam = nil
    for i = 1, #players do
        local player = players[i]
        if player.id == myId then
            myTeam = player.team
            break
        end
    end

    local myTeamPlayers = {}
    for i = 1, #players do
        local player = players[i]
        if player.team == myTeam and player.id ~= myId and (not aliveOnly or player.alive == true) then
            myTeamPlayers[#myTeamPlayers + 1] = player
        end
    end
    return myTeam, myTeamPlayers
end

---@return { inMatch: boolean, matchId: string|nil, matchData: table|nil }
function KOSState.getSnapshot()
    return {
        inMatch = KOSState.inMatch,
        matchId = KOSState.matchId,
        matchData = KOSState.matchData,
    }
end

RegisterNetEvent(Events.CLIENT_MATCH_DATA_SYNC, function(data)
    KOSState.setMatchData(data)
end)

RegisterNetEvent(Events.CLIENT_MATCH_CLEAR, function()
    KOSState.clear()
end)

RegisterNetEvent(Events.CLIENT_MATCH_CREATED, function(matchId)
    TriggerEvent('kos:client:matchCreated', matchId)
end)


RegisterCommand('kos:state', function()
    lib.print.debug(KOSState.getSnapshot())
end, false)
