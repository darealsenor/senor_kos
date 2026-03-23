local drops = require 'client.core.drops'
-- local superpowers = require 'client.features.drop.limiter'  -- Note: this feature was intended for my own server, you can either ignore this file or implement it yourself, it's pretty much irrelevant.

RegisterNetEvent('senor-airdrops:client:NewDrop')
AddEventHandler('senor-airdrops:client:NewDrop', drops.createDrop)

RegisterNetEvent('senor-airdrops:client:RemovedDrop')
AddEventHandler('senor-airdrops:client:RemovedDrop', drops.removeDrop)

RegisterNetEvent('senor-airdrops:client:OpenMenu')
AddEventHandler('senor-airdrops:client:OpenMenu', OpenMenu)

AddEventHandler('onResourceStop', function(resourceName)
    if (GetCurrentResourceName() ~= resourceName) then
        return
    end
    drops.removeDrops()
    -- superpowers.check(false) -- Note: this feature was intended for my own server, you can either ignore this file or implement it yourself, it's pretty much irrelevant.
end)

AddEventHandler('airdrops:client:playerLoaded', function()
    drops.CreateDrops()
end)

AddEventHandler('airdrops:client:playerUnloaded', function()
    drops.removeDrops()
end)