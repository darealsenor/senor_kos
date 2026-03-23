local dropsService = {}

local utils = require 'client.utils.utils'
local pointsService = require 'client.services.points_service'
local GetBlip = require 'client.features.drop.blip'.GetBlip

function dropsService.createModel(model, coords)
    lib.requestModel(model)
    local entity = CreateObject(
        model,
        coords.x,
        coords.y,
        coords.z,
        false,
        true,
        false
    )

    PlaceObjectOnGroundProperly(entity)
    FreezeEntityPosition(entity, true)

    SetModelAsNoLongerNeeded(entity)

    return entity
end

function dropsService.particle(coords)
    lib.requestNamedPtfxAsset(Config.Customization.Particle.asset)
    SetPtfxAssetNextCall(Config.Customization.Particle.asset)
    local particle = StartParticleFxLoopedAtCoord(
        Config.Customization.Particle.effectName,
        coords.x,
        coords.y,
        coords.z + Config.Customization.Particle.zOffset,
        Config.Customization.Particle.rotation.x,
        Config.Customization.Particle.rotation.y,
        Config.Customization.Particle.rotation.z,
        Config.Customization.Particle.scale,
        false,
        false,
        false,
        false
    )
    SetParticleFxLoopedAlpha(particle, Config.Customization.Particle.alpha)
    SetParticleFxLoopedColour(
        particle,
        Config.Customization.Particle.color.r,
        Config.Customization.Particle.color.g,
        Config.Customization.Particle.color.b,
        false
    )
    RemoveNamedPtfxAsset(Config.Customization.Particle.asset)

    return particle
end

function dropsService.blip(data)
    local blip = AddBlipForCoord(data.coords.x, data.coords.y, data.coords.z)
    local blipSprite = GetBlip(data.weapons)
    SetBlipSprite(blip, blipSprite or Config.Customization.Blip.sprite)
    SetBlipColour(blip, Config.Customization.Blip.color)
    SetBlipScale(blip, Config.Customization.Blip.scale)
    SetBlipAsShortRange(blip, Config.Customization.Blip.shortRange)
    BeginTextCommandSetBlipName("STRING")
    AddTextComponentString(Config.Customization.Blip.name)
    EndTextCommandSetBlipName(blip)

    return blip
end

function dropsService.radiusBlip(coords, radius)
    local radiusBlip = AddBlipForRadius(coords.x, coords.y, coords.z, radius + Config.Customization.Radius.offset)
    SetBlipColour(radiusBlip, Config.Customization.Radius.color)
    SetBlipAlpha(radiusBlip, Config.Customization.Radius.alpha)

    BeginTextCommandSetBlipName("STRING")
    AddTextComponentString(Config.Customization.Radius.name)
    EndTextCommandSetBlipName(radiusBlip)

    return radiusBlip
end

function dropsService.createZone(data)
    local point = lib.points.new({
        coords = vector3(data.coords.x, data.coords.y, data.coords.z),
        distance = data.distance
    })

    local _inside = false

    function point:onEnter()
        pointsService.onEnter(data)
        _inside = true
    end

    function point:onExit()
        pointsService.onExit(data)
        _inside = false
    end

    local function removeZoneWrapper()
        if _inside then
            pointsService.onExit(data) -- old lib doesn't have onExit when removing for some reason
        end
        return point:remove()
    end

    function point:nearby()
        pointsService.nearby(point, data)
    end

    return point, removeZoneWrapper
end

function dropsService.reactiveRadiusBlip(blip, data)
    if not (data and data.client and data.client.active) then return end


    local delay4min = math.max((data.timeLeft - Config.BlipColorChanges.WarningTime), 0)
    CreateThread(function()
        Wait(delay4min * 1000)
        if data and data.client and data.client.active then
            SetBlipColour(blip, Config.BlipColorChanges.WarningColor)
        end
    end)

    local delay1min = math.max((data.timeLeft - Config.BlipColorChanges.CriticalTime), 0)
    CreateThread(function()
        Wait(delay1min * 1000)
        if data and data.client and data.client.active then
            SetBlipColour(blip, Config.BlipColorChanges.CriticalColor)
        end
    end)
end

return dropsService
