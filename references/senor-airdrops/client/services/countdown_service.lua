local countdown = {}

-- local dropLimiter = require 'client.features.drop.limiter'

function countdown.create(data)
    Citizen.CreateThreadNow(function()
        while data.timeLeft > 0 do
            Wait(Config.Timer.CountdownUpdateInterval)
            data.timeLeft = data.timeLeft - 1
        end
    end)
    -- Note: this feature was intended for my own server, you can either ignore this file or implement it yourself, it's pretty much irrelevant.
    -- local lockDelay = math.max(data.lockTime - 30, 0)
    -- Citizen.CreateThreadNow(function()
    --     Wait(lockDelay * 1000)
    --     data.notified = true
    --     if dropLimiter then
    --         dropLimiter.check(data)
    --     end
    -- end)
end

local function textFormat(interaction)
    if interaction == 'Keystroke' then return locale('countdown_drop_open_keystroke') end
    return locale('countdown_drop_open_interaction')
end

function countdown.Format(seconds, interaction)
	local total = math.max(0, math.floor(seconds + 0.5))
	if total <= 0 then
        return textFormat(interaction)
    end

	local mins = math.floor(total / 60)
	local secs = total % 60
    return ("%02d:%02d"):format(mins, secs)
end

function countdown.Show(visible, data)
    SendReactMessage('setVisibleCountdown', visible)
    if data then
        SendReactMessage('JoinedAirdrop', {
            startTime = data.startTime,
            timeLeft = data.timeLeft,
            lockTime = data.lockTime
        })
    else
        SendReactMessage('CancelAirdrop')
    end
end

return countdown
