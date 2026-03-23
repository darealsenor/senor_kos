local utils = require 'client.utils.utils'
local dropsService = require 'client.services.drops_service'
local countdown = require 'client.services.countdown_service'
local interaction = require 'client.pickup.interaction'

local drops = {}

local function GetDrops()
    return drops
end

exports('GetDrops', GetDrops)

local function GetDropAtCoords(coords)
    for _, drop in ipairs(drops) do
        local dropCoords = drop.coords
        local dist = #(vec3(dropCoords.x, dropCoords.y, dropCoords.z) - coords)

        if dist <= drop.distance then
            return drop
        end
    end
    return false
end

exports('GetDropAtCoords', GetDropAtCoords)

local function GetLocalDrop(dropId)
    for i = 1, #drops do
        local currentDrop = drops[i]
        if currentDrop.id == dropId then
            return currentDrop, i
        end
    end
    return false
end

local function createDrop(data)
	utils.Notification(locale('notification_new_drop_title'),
		locale('notification_new_drop_desc', math.floor(data.lockTime),
            utils.GetStreetNameAtCoords(data.coords)))

    local entity = dropsService.createModel(Config.DropModel, data.coords)
    local particle = dropsService.particle(data.coords)
    local blip = dropsService.blip(data)
    local radiusBlip = dropsService.radiusBlip(data.coords, data.distance)

    data.client = {
        entity = entity,
        particle = particle,
        blip = blip,
        radiusBlip = radiusBlip,
        active = true
    }

    local zone, removeZone = dropsService.createZone(data)

    data.client.zone = zone
    data.client.removeZone = removeZone

    countdown.create(data)

    if data.interaction == 'Interaction' then
        interaction.init(entity, data)
    end

    dropsService.reactiveRadiusBlip(radiusBlip, data)
    drops[#drops + 1] = data
end

local function CreateDrops()
    local retvalDrops = lib.callback.await('senor-airdrops:server:GetAirdrops', false)
    for i = 1, #retvalDrops do
        local currentDrop = retvalDrops[i]
        createDrop(currentDrop)
    end
end

local function RemoveDropLocal(data)
    if not data.client then return end
    
    DeleteEntity(data.client.entity)
    StopParticleFxLooped(data.client.particle, 0)
    RemoveBlip(data.client.blip)
    RemoveBlip(data.client.radiusBlip)
    data.client.removeZone()

    if data.interaction == 'Interaction' and data.client.entity then
        interaction.remove(data.client.entity)
    end
    
    data.client.active = false
end

local function removeDrop(data)
    local drop, index = GetLocalDrop(data.id)
    if not drop then
        return
    end

    RemoveDropLocal(drop)
    table.remove(drops, index)
end

local function removeDrops()
    for _, drop in ipairs(drops) do
        RemoveDropLocal(drop)
    end
end

return {
    createDrop = createDrop,
    removeDrop = removeDrop,
    removeDrops = removeDrops,
    CreateDrops = CreateDrops,
}
