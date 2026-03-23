--[[ 
    Note from script developer: this feature was 
    intended to use on my own server, you can either ignore this file
    or implement it by yourself, its pretty much irrelveant.
]]

-- local indicator = require 'client.features.drop.indicator'

-- local function safeToggleExport(resourceName, funcName, ...)
--     if GetResourceState(resourceName) == 'started' then
--         local resource = exports[resourceName]
--         if resource and resource[funcName] then
--             local args = { ... }
--             pcall(function()
--                 resource[funcName](table.unpack(args))
--             end)
--         end
--     end
-- end

-- local function toggleSuperpowers(boolean)
--     TriggerEvent('senor-beefworld:client:DisablePowers', boolean)
--     safeToggleExport('ginola_plus', 'disableSuperPowers', boolean, boolean, boolean, boolean)
--     safeToggleExport('r9-wraith', 'setWraithActive', boolean, boolean)
--     safeToggleExport('r9-alarmbot', 'setAlarmbotActive', boolean, boolean)
--     safeToggleExport('r9-fade', 'setFadeActive', boolean, boolean)
--     safeToggleExport('r9-gravitybomb', 'setGravitybombActive', boolean, boolean)
--     safeToggleExport('r9-mimaggy', 'setMaggyActive', boolean, boolean)
--     safeToggleExport('r9-shift', 'setShiftActive', not boolean, not boolean)
--     safeToggleExport('r9-sniper', 'setSniperActive', boolean, boolean)
--     safeToggleExport('r9-stepper', 'setStepperActive', boolean, boolean)
--     safeToggleExport('r9-unit', 'setUnitActive', boolean, boolean)
--     safeToggleExport('r9-utils', 'setUtilsActive', boolean, boolean)
-- end

-- local function check(data)
--     if data and data.notified and indicator.isInside(data) then
--         toggleSuperpowers(true)
--         -- lib.notify({
--         --     id = 'airdrops',
--         --     title = 'Airdrops - Warning',
--         --     description = 'Your superpowers are disabled for now',
--         --     type = 'warning',
--         --     position = 'center-left'
--         -- })
--     else
--         -- lib.notify({
--         --     id = 'airdrops',
--         --     title = 'Airdrops - Warning',
--         --     description = 'Your superpowers are enabled for now',
--         --     type = 'warning',
--         --     position = 'center-left'
--         -- })
--         toggleSuperpowers(false)
--     end
-- end

-- return {
--     check = check
-- }
