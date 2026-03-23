local Airdrop = exports[GetCurrentResourceName()]

local manager = require 'server.services.manager_service'
local locations = require 'server.services.location_service'
local prizes = require 'server.services.prize_service'
local history = require 'server.features.history'
local weapons = require 'shared.weapons'.uiLabels


RegisterCommand(Config.Commands.Main, function(source)
    local isAdmin = Bridge.framework.IsAdmin(source)

    TriggerClientEvent('senor-airdrops:client:OpenMenu', source, {
        isAdmin = isAdmin,
        prizes = isAdmin and prizes:Get() or {},
        coords = isAdmin and locations:Get() or {},
    }, manager.GetAirdrops(true), history:get())
end, false)


local function GetRandomWeapons()
    local randomnumber = math.random(0, Config.AutoDrop.WeaponRandomMax)
    if randomnumber > Config.AutoDrop.WeaponRandomThreshold then return 'Pistols' else return 'Regular' end
end

lib.addCommand(Config.Commands.Drops, {
    help = Config.Commands.DropsHelp,
    params = {
        {
            name = 'time',
            type = 'number',
            help = locale('command_param_time_help'),
            optional = true
        },
        {
            name = 'useCurrentCoords',
            type = 'string',
            help = locale('command_param_usecurrentcoords_help'),
            optional = true
        },
        {
            name = 'distance',
            type = 'number',
            help = locale('command_param_distance_help'),
            optional = true
        },
        {
            name = 'pistols',
            type = 'string',
            help = locale('command_param_pistols_help'),
            optional = true
        },
    },
}, function(source, args)
    if not Bridge.framework.IsAdmin(source) then
        Bridge.notify.Notify(source, {
            title = locale('notification_title'),
            description = locale('notification_not_admin'),
            type = 'error'
        })
        return
    end
    local time = args.time or Config.Defaults.LockTime
    local useCurrentCoords = args.useCurrentCoords == 'true'
    local distance = args.distance or Config.Defaults.Distance
    local _weapons = args.pistols == 'true' and 'Pistols' or GetRandomWeapons()

    if source == 0 then
        useCurrentCoords = false
    end

    local coords = useCurrentCoords and GetEntityCoords(GetPlayerPed(source)) or nil

    local result = Airdrop:CreateDrop({
        playerId = source,
        coords = coords,
        lockTime = time,
        distance = distance,
        weapons = _weapons,
        settings = {}
    })

    if source ~= 0 then
        Bridge.notify.Notify(source, {
            title = locale('notification_title'),
            description = result.message,
            type = result.success and 'inform' or 'error'
        })
    end
end)

lib.addCommand('videodrops', {
    help = 'Create 3 demo drops for video blip color showcase',
}, function(source, _args)
    if not Bridge.framework.IsAdmin(source) then
        Bridge.notify.Notify(source, {
            title = locale('notification_title'),
            description = locale('notification_not_admin'),
            type = 'error'
        })
        return
    end

    local drops = {
        { coords = vector3(-1057.34, -1026.85, 1.22), seconds = 610 }, -- 10m10s
        { coords = vector3(-1172.0, -1092.36, 1.13), seconds = 250 },  -- 240s + 10s
        { coords = vector3(-1060.17, -1264.36, 5.06), seconds = 70 },  -- 60s + 10s
    }

    for i = 1, #drops do
        Airdrop:CreateDrop({
            playerId = source,
            coords = drops[i].coords,
            lockTime = drops[i].seconds / 60,
            distance = 30.0,
            weapons = 'Regular',
            settings = {}
        })
    end

    if source ~= 0 then
        Bridge.notify.Notify(source, {
            title = locale('notification_title'),
            description = 'Video drops created',
            type = 'inform'
        })
    end
end)