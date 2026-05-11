local announceSeq = 0
local disableShootingThread = false

local function disableShooting()
    disableShootingThread = true
    while disableShootingThread do
        DisableControlAction(0, 140, true)
        DisablePlayerFiring(cache.playerId, true)
        Wait(0)
    end
end

local function resolveWinnerMessage(winnerTeam)
    if winnerTeam == 'teamA' then
        return 'TEAM A WINS'
    end
    if winnerTeam == 'teamB' then
        return 'TEAM B WINS'
    end
    return 'ROUND DRAW'
end

local function isPayloadMatch(payload)
    local snap = KOSState.getSnapshot()
    if not payload or type(payload) ~= 'table' or not payload.matchId then
        return false
    end
    if not snap or not snap.matchId then
        return true
    end
    return payload.matchId == snap.matchId
end

RegisterNetEvent(Events.CLIENT_ROUND_START, function(payload)
    if not isPayloadMatch(payload) then
        return
    end

    announceSeq = announceSeq + 1
    local token = announceSeq

    local seconds = math.max(1, tonumber(payload.countdownSeconds) or 3)
    local freezeDuration = math.max(seconds * 1000, tonumber(payload.freezeMs) or 0)

    SendNUIMessage({
        action = 'setAnnouncer',
        data = {
            visible = true,
            type = 'start',
            title = 'ROUND STARTING',
            subtitle = 'PREPARE FIRING',
            seconds = seconds,
            colorTheme = 'neutral'
        }
    })

    CreateThread(function()
        if token ~= announceSeq then
            return
        end

        if freezeDuration <= 0 then
            return
        end

        FreezeEntityPosition(cache.ped, true)
        Wait(freezeDuration)
        FreezeEntityPosition(cache.ped, false)
    end)

    CreateThread(function()
        if token ~= announceSeq then
            return
        end

        CreateThread(disableShooting)
        Wait(freezeDuration)
        disableShootingThread = false
    end)
end)

RegisterNetEvent(Events.CLIENT_ROUND_END, function(payload)
    if not isPayloadMatch(payload) then
        return
    end

    announceSeq = announceSeq + 1

    local winnerMsg = resolveWinnerMessage(payload.winnerTeam)
    local hasNextRound = payload.nextRound ~= false
    local subtitle = hasNextRound and 'NEXT ROUND IN' or 'MATCH OVER'
    local seconds = hasNextRound and 3 or 0

    local colorTheme = 'neutral'
    if payload.winnerTeam == 'teamA' then
        colorTheme = 'teamA'
    elseif payload.winnerTeam == 'teamB' then
        colorTheme = 'teamB'
    end

    SendNUIMessage({
        action = 'setAnnouncer',
        data = {
            visible = true,
            type = 'end',
            title = winnerMsg,
            subtitle = subtitle,
            seconds = seconds,
            colorTheme = colorTheme
        }
    })
end)

RegisterNetEvent(Events.CLIENT_MATCH_END, function(payload)
    if not isPayloadMatch(payload) then
        return
    end

    announceSeq = announceSeq + 1

    local winnerMsg = resolveWinnerMessage(payload.winnerTeam) .. ' - MATCH WINNER'
    
    local colorTheme = 'neutral'
    if payload.winnerTeam == 'teamA' then
        colorTheme = 'teamA'
    elseif payload.winnerTeam == 'teamB' then
        colorTheme = 'teamB'
    end

    SendNUIMessage({
        action = 'setAnnouncer',
        data = {
            visible = true,
            type = 'end',
            title = winnerMsg,
            subtitle = 'VICTORY REACHED',
            seconds = 5,
            colorTheme = colorTheme
        }
    })
end)
