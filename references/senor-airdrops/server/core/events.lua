local Airdrop = exports[GetCurrentResourceName()]
local manager = require 'server.services.manager_service'
local prizes = require 'server.services.prize_service'
local locations = require 'server.services.location_service'
local adminOnly = require 'server.utils.utils'.adminOnly
local log = require 'server.features.log'

RegisterNetEvent('senor-airdrops:server:Opendrop')
AddEventHandler('senor-airdrops:server:Opendrop', function(dropId)
    local playerId = source
    local drop = manager.GetDropById(dropId)
    if not drop then return end

    if drop.interaction == 'Keystroke' or drop.interaction == 'Interaction' then
        drop:open(playerId)
    end
end)

lib.callback.register('senor-airdrops:server:CreateDrop', adminOnly(function(source, data)
    local dropCreation = Airdrop:CreateDrop({
        playerId = source,
        coords = vector3(data.coords.x, data.coords.y, data.coords.z),
        lockTime = data.lockTime,
        distance = data.distance,
        prizes = data.prizes or {},
        weapons = data.weapons,
        settings = data.settings or {},
        interaction = data.interaction
    })

    if dropCreation.success then
        return {
            success = true,
            data = manager.GetAirdrops(true),
            message = locale('message_airdrop_spawned')
        }
    end

    return dropCreation
end))

lib.callback.register('senor-airdrops:server:SaveLocation', adminOnly(function(source, data)
    return locations:Update(data.id, data)
end))

lib.callback.register('senor-airdrops:server:AddLocation', adminOnly(function(source, data)
    return locations:Add(data)
end))

lib.callback.register('senor-airdrops:server:DeleteLocation', adminOnly(function(source, data)
    return locations:Remove(data.id)
end))

lib.callback.register('senor-airdrops:server:DeleteDrop', adminOnly(function(source, dropId)
    local drop = manager.GetDropById(dropId)
    if not drop then
        return {
            success = false,
            message = locale('message_airdrop_not_found')
        }
    end

    log.new(source, drop, locale('message_airdrop_removed'), source, true)

    drop:remove()
    return {
        success = true,
        message = locale('message_airdrop_removed'),
        drops = manager.GetAirdrops(true)
    }
end))

lib.callback.register('senor-airdrops:server:AddPrize', adminOnly(function(source, data)
    return prizes:Add(data)
end))

lib.callback.register('senor-airdrops:server:RemovePrize', adminOnly(function(source, data)
    return prizes:Remove(data.id)
end))

lib.callback.register('senor-airdrops:server:EditPrize', adminOnly(function(source, data)
    return prizes:Update(data.id, data.amount)
end))

lib.callback.register('senor-airdrops:server:GetAirdrops', function(source)
    return manager.GetAirdrops(true)
end)
