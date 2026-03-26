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
        return '~g~Team A~s~ wins'
    end
    if winnerTeam == 'teamB' then
        return '~b~Team B~s~ wins'
    end
    return 'Round draw'
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

    CreateThread(function()
        if token ~= announceSeq then
            return
        end

        local banner = lib.scaleform:new({
            name = 'MP_BIG_MESSAGE_FREEMODE',
            fullScreen = true,
        })
        banner:callMethod('SHOW_SHARD_CENTERED_MP_MESSAGE', {})
        banner:callMethod('SHARD_SET_TEXT', { 'Round starting', ('Starting in %ds'):format(seconds), 0 })

        local countdown = nil
        if seconds > 0 then
            countdown = lib.scaleform:new({
                name = 'COUNTDOWN',
                fullScreen = true,
            })
            countdown:callMethod('SET_MESSAGE', { seconds, 0, 200, 255, true })
            countdown:callMethod('FADE_MP', { seconds, 0, 200, 255 })
        end

        local showBannerActive = true
        local showCountdownActive = seconds > 0
        local startDraw = GetGameTimer()

        CreateThread(function()
            while showBannerActive do
                if token ~= announceSeq then
                    showBannerActive = false
                    showCountdownActive = false
                    return
                end
                Wait(1)
                banner:draw()
            end
        end)

        if countdown then
            CreateThread(function()
                while showCountdownActive do
                    if token ~= announceSeq then
                        showCountdownActive = false
                        return
                    end
                    Wait(1)
                    countdown:draw()
                end
            end)

            local t = seconds
            while t > 1 do
                Wait(1000)
                if token ~= announceSeq then
                    showCountdownActive = false
                    showBannerActive = false
                    break
                end
                t = t - 1
                countdown:callMethod('SET_MESSAGE', { t, 0, 200, 255, true })
                countdown:callMethod('FADE_MP', { t, 0, 200, 255 })
            end

            Wait(1000)
            showCountdownActive = false
        end

        local elapsed = GetGameTimer() - startDraw
        local targetBannerMs = seconds > 0 and (seconds * 1000) or 2000
        if elapsed < targetBannerMs then
            Wait(targetBannerMs - elapsed)
        end
        showBannerActive = false
        banner:dispose()
        if countdown then
            countdown:dispose()
        end
    end)

    CreateThread(function()
        if token ~= announceSeq then
            return
        end

        Wait(1000)
        FreezeEntityPosition(cache.ped, true)
        Wait(2000)
        FreezeEntityPosition(cache.ped, false)
    end)

    CreateThread(function()
        if token ~= announceSeq then
            return
        end

        CreateThread(disableShooting)
        Wait(3000)
        disableShootingThread = false
    end)
end)

RegisterNetEvent(Events.CLIENT_ROUND_END, function(payload)
    if not isPayloadMatch(payload) then
        return
    end

    announceSeq = announceSeq + 1
    local token = announceSeq

    local winnerMsg = resolveWinnerMessage(payload.winnerTeam)
    local hasNextRound = payload.nextRound ~= false
    local subtitle = hasNextRound and 'Next round in' or 'Match over'
    local seconds = hasNextRound and 3 or 0

    CreateThread(function()
        if token ~= announceSeq then
            return
        end

        local banner = lib.scaleform:new({
            name = 'MP_BIG_MESSAGE_FREEMODE',
            fullScreen = true,
        })
        banner:callMethod('SHOW_SHARD_CENTERED_MP_MESSAGE', {})
        banner:callMethod('SHARD_SET_TEXT', { winnerMsg, subtitle, 0 })

        local countdown = nil
        if seconds > 0 then
            countdown = lib.scaleform:new({
                name = 'COUNTDOWN',
                fullScreen = true,
            })
            countdown:callMethod('SET_MESSAGE', { seconds, 0, 200, 255, true })
            countdown:callMethod('FADE_MP', { seconds, 0, 200, 255 })
        end

        local showBannerActive = true
        local showCountdownActive = seconds > 0


        CreateThread(function()
            while showBannerActive do
                if token ~= announceSeq then
                    showBannerActive = false
                    showCountdownActive = false
                    return
                end
                Wait(1)
                banner:draw()
            end
        end)

        if countdown and seconds > 0 then
            CreateThread(function()
                while showCountdownActive do
                    if token ~= announceSeq then
                        showCountdownActive = false
                        return
                    end
                    Wait(1)
                    countdown:draw()
                end
            end)

            CreateThread(function()
                local t = seconds
                while t > 1 do
                    Wait(1000)
                    if token ~= announceSeq then
                        showCountdownActive = false
                        return
                    end
                    t = t - 1
                    countdown:callMethod('SET_MESSAGE', { t, 0, 200, 255, true })
                    countdown:callMethod('FADE_MP', { t, 0, 200, 255 })
                end

                Wait(1000)
                showCountdownActive = false
            end)
        end

        local bannerWaitMs = 2000
        Wait(bannerWaitMs)
        showBannerActive = false

        if seconds > 0 then
            Wait(seconds * 1000)
        end

        banner:dispose()
        if countdown then
            countdown:dispose()
        end
    end)
end)

