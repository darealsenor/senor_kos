local activeTimers = {}
local function startTimer(duration, callback, timerId)
    activeTimers[timerId] = true

    Citizen.CreateThreadNow(function()
        local startTime = os.time()
        while os.time() - startTime < duration do
            if not activeTimers[timerId] then
                return
            end
            Wait((ServerConfig.Timer and ServerConfig.Timer.CheckInterval) or 500)
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

local function stopTimer(timerId)
    activeTimers[timerId] = nil
end

return {
    startTimer = startTimer,
    timerActive = timerActive,
    stopTimer = stopTimer,
}