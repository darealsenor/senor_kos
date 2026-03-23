local manager = require 'server.services.manager_service'
local locations = require 'server.services.location_service'
local class = require 'server.core.class'

local function CreateDrop(data)
    if type(data) ~= 'table' then
        return { success = false, message = locale('error_data_not_table') }
    end

    if type(data.playerId) ~= 'number' then
        return { success = false, message = locale('error_playerid_not_number') }
    end

    if not data.coords then
        local randomLocation = locations:GetRandom()
        if not randomLocation.success then return {success = false, message = locale('message_no_locations')} end
        data.coords = randomLocation.coords
    end

    local isIntersecting = manager.isDropIntersecting(data.coords, data.distance)
    if isIntersecting.success then return isIntersecting end

    local instance = class:new(data)

    return {
        success = true,
        message = locale('message_airdrop_created'),
        data = instance
    }
end

local function GetDrops()
    return manager.GetAirdrops()
end

local function GetDropByID(id)
    local result = manager.GetDropById(id)
    return result
end

exports('CreateDrop', CreateDrop)
exports('GetDrops', GetDrops)
exports('GetDropByID', GetDropByID)
