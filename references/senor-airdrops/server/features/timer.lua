local activeTimers = {}
local function startTimer(duration, callback, timerId)
    activeTimers[timerId] = true

    Citizen.CreateThreadNow(function()
        local startTime = os.time()
        while os.time() - startTime < duration do
            if not activeTimers[timerId] then
                return
            end
            Wait(Config.Timer.CheckInterval)
        end

        if activeTimers[timerId] then
            callback()
        end

        activeTimers[timerId] = nil
    end)

    return timerId
end

local function timerActive(timerId)
    return activeTimers[timerId]
end

return {
    startTimer = startTimer,
    timerActive = timerActive,
}