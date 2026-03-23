local afterdrop = require 'server.features.afterdrop'
local log = require 'server.features.log'
local utils = require 'server.utils.utils'

local dropService = {}

function dropService.handleWinner(playerId, instance)
    if instance.prizes then
        for i = 1, #instance.prizes do
            local currentItem = instance.prizes[i]
            local amountToGive = currentItem.amount

            if Config.PrizeReduction.Enabled then
                local enoughPlayers = utils.EnoughPlayers()
                if not enoughPlayers then
                    if currentItem.amount <= Config.PrizeReduction.MinAmount then
                        goto continue
                    end

                    amountToGive = math.floor(currentItem.amount / Config.PrizeReduction.Divisor)
                    if amountToGive < Config.PrizeReduction.MinReducedAmount then
                        goto continue
                    end
                end
            end

            Bridge.inventory.AddItem(playerId, currentItem.name, amountToGive, currentItem.metadata or {})
            ::continue::
        end
    end

    local winnerName = Bridge.framework.GetPlayerName(playerId)
    local message = locale('notification_winner_message', winnerName)
    afterdrop.disarm(instance.coords, instance.distance, message)
    log.new(playerId, instance, locale('log_picked_up_drop', winnerName))
end

return dropService