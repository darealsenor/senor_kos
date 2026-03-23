local pointsService = {}

local utils = require 'client.utils.utils'
local Format = require 'client.services.countdown_service'.Format
local settingsFactory = require 'client.services.settings_service'
local countdown = require 'client.services.countdown_service'
local keystroke = require 'client.pickup.keystroke'
local weaponLimiter = require 'client.features.weapon.limiter'
local vehicleLimiter = require 'client.features.vehicle.limiter'
-- local dropLimiter = require 'client.features.drop.limiter' -- Note: this feature was intended for my own server, you can either ignore this file or implement it yourself, it's pretty much irrelevant.
local indicator = require 'client.features.drop.indicator'

function pointsService.onEnter(data)
    utils.Notification(locale('notification_entrance_title'), locale('notification_entrance_desc'), 'inform')
    settingsFactory.init(data)
    countdown.Show(true, data)
    indicator.set(data)
    -- dropLimiter.check(data) -- Note: this feature was intended for my own server, you can either ignore this file or implement it yourself, it's pretty much irrelevant.
    vehicleLimiter.vehicleLimiterThread(true, data)
    weaponLimiter.set(true, data.weapons)
    weaponLimiter.validateWeapon(cache.weapon)
end

function pointsService.onExit(data)
    utils.Notification(locale('notification_disband_title'), locale('notification_disband_desc'), 'inform')
    countdown.Show(false)
    indicator.set(nil)
    -- dropLimiter.check(nil) -- Note: this feature was intended for my own server, you can either ignore this file or implement it yourself, it's pretty much irrelevant.
    vehicleLimiter.vehicleLimiterThread(false, data)
    weaponLimiter.set(false, nil)
    settingsFactory.disable(data)
end

function pointsService.nearby(point, data)
    if point.currentDistance < 10 then
        utils.Draw3DText(data.coords.x, data.coords.y, data.coords.z, 1.0, Format(data.timeLeft, data.interaction))
    end

    CreateThread(function()
        if data.interaction == 'Keystroke' then
            keystroke.init(point, data)
        end
    end)
end

return pointsService

