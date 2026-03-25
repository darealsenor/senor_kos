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
