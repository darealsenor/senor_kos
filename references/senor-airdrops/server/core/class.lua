if GetCurrentResourceName() ~= "senor-airdrops" then
    for i = 1, 100 do
        print(('^1[senor-airdrops] ^2WARNING: ^1Resource name should be ^3senor-airdrops^1, not ^3%s'):format(GetCurrentResourceName()))
        print('^1[senor-airdrops] ^2WARNING: ^1SCRIPT WILL NOT WORK UNTIL YOU FIX THIS ISSUE')
        Wait(3000)
    end
end

local utils = require 'server.utils.utils'
local airdrop = lib.class('Airdrop')
local classService = require 'server.services.class_service'
local manager = require 'server.services.manager_service'
local timer = require 'server.features.timer'
local prizes = require 'server.services.prize_service'
local locations = require 'server.services.location_service'
local logs = require 'server.features.log'

function airdrop:constructor(data)
    local ostime = os.time()
    self.playerId = data.playerId
    self.coords = data.coords
    self.startTime = ostime
		self.lockTime = math.floor((data.lockTime * 60) + 0.5)
    self.distance = data.distance or Config.Defaults.Distance
    self.prizes = data.prizes or prizes:Get() or {}
    self.weapons = data.weapons or nil
    self.settings = data.settings or {}
    self.dropState = 0

    local endTime = self.startTime + self.lockTime
    self.timeLeft = endTime - ostime

    self.id = utils.uuid()

    self.timer = timer.startTimer(self.lockTime, function()
        self:setDropState(1)
        CreateThread(function()
            Wait(Config.AutoRemoveAfterUnlockDelay * 1000)
            if self then
                self:remove()
            end
        end)
    end, self.id)

    self.interaction = data.interaction or Config.Defaults.Interaction

    manager.AddAirdrop(self)
    logs.new(data.playerId, self, 'New drop created', data.playerId)
end

function airdrop:remove()
    return classService.remove(self)
end

function airdrop:open(playerId)
    return classService.open(playerId, self)
end

function airdrop:get()
    local now = os.time()
    local elapsed = now - self.startTime
    local timeLeft = math.max(self.lockTime - elapsed, 0)

    return {
        coords = { x = self.coords.x, y = self.coords.y, z = self.coords.z },
        distance = self.distance,
        startTime = self.startTime,
        weapons = self.weapons,
        settings = self.settings,
        lockTime = self.lockTime,
        id = self.id,
        timeLeft = timeLeft,
        interaction = self.interaction
    }
end

function airdrop:setDropState(newState)
    return classService.setDropState(self, newState)
end

return airdrop
