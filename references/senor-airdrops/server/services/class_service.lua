local manager = require 'server.services.manager_service'
local dropService = require 'server.services.drop_service'
local timers = require 'server.features.timer'
local history = require 'server.features.history'
local locations = require 'server.services.location_service'
local classService = {}

function classService.remove(instance)
    local loc = locations:FindByCoords(instance.coords)
    if loc then
        locations:SetTaken(loc.id, false)
    end

    manager.RemoveAirdrop(instance)
end

function classService.open(playerId, instance)
    local timer = timers.timerActive(instance.id)
    if not timer then
        dropService.handleWinner(playerId, instance)
        history.add(playerId, instance:get())
        instance:remove()
        return { success = true, message = locale('message_airdrop_removed') }
    end

    return { success = false, message = locale('message_opening_failed') }
end

function classService.setDropState(instance, newState)
    instance.dropState = newState
end

return classService
