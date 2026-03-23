local pickup = require 'shared.pickup'.uiLabels
local settings = require 'shared.settings'.uiLabels
local weapons = require 'shared.weapons'.uiLabels
local utils = require 'client.utils.utils'

local function GetLocaleData()
    local path = ('locales.%s'):format(lib.getLocaleKey() or 'en')
    local locales = lib.loadJson(path)
    return locales or {}
end

local function SendLocaleData()
    local localeData = GetLocaleData()
    SendReactMessage('setLocale', localeData)
end

CreateThread(function()
    Wait(1000)
    SendLocaleData()
end)

function SendReactMessage(action, data)
    SendNUIMessage({
        action = action,
        data = data
    })
end

function ToggleNuiFrame(shouldShow)
    SetNuiFocus(shouldShow, shouldShow)
    SendReactMessage('setVisible', shouldShow)
end

RegisterNUICallback('hideFrame', function(_, cb)
    ToggleNuiFrame(false)
    cb({})
end)

local function GetThemeConfig()
    local theme = Config.Theme or {}
    return {
        mode = theme.Mode or "dark",
        background = theme.Background and string.format('%s %s%% %s%%', theme.Background.h, theme.Background.s, theme.Background.l) or nil,
        border = theme.Border and string.format('%s %s%% %s%%', theme.Border.h, theme.Border.s, theme.Border.l) or nil,
        primary = theme.Primary and string.format('%s %s%% %s%%', theme.Primary.h, theme.Primary.s, theme.Primary.l) or nil
    }
end

RegisterNUICallback('nuiLoaded', function(_, cb)
    SendLocaleData()
    local themeConfig = GetThemeConfig()
    SendReactMessage('setTheme', themeConfig)
    cb({
        success = true,
        data = {
            weapons = weapons,
            interaction = pickup,
            settings = settings
        }
    })
end)

RegisterNUICallback('airdrops.createDrop', function(data, cb)
    local result = lib.callback.await('senor-airdrops:server:CreateDrop', false, data)
    cb(result)
end)

RegisterNUICallback('airdrops.client.GetCoords', function(_, cb)
    local myCoords = GetEntityCoords(cache.ped)
    cb({ success = true, data = { x = myCoords.x, y = myCoords.y, z = myCoords.z } })
end)

RegisterNUICallback('airdrops.client.GetStreet', function(_, cb)
    local myCoords = GetEntityCoords(cache.ped)
    local street = GetStreetNameAtCoord(myCoords.x, myCoords.y, myCoords.z)
    cb({ success = true, data = GetStreetNameFromHashKey(street) })
end)

RegisterNUICallback('setWaypoint', function(data, cb)
    SetNewWaypoint(data.x, data.y)
    cb({ success = true, message = locale('message_waypoint_set') })
end)

RegisterNUICallback('airdrops.saveLocation', function(data, cb)
    local result = lib.callback.await('senor-airdrops:server:SaveLocation', false, data)
    cb(result)
end)

RegisterNUICallback('airdrops.AddLocation', function(data, cb)
    local result = lib.callback.await('senor-airdrops:server:AddLocation', false, data)
    cb(result)
end)

RegisterNUICallback('airdrops.deleteLocation', function(data, cb)
    local result = lib.callback.await('senor-airdrops:server:DeleteLocation', false, data)
    cb(result)
end)

RegisterNUICallback('airdrops.DeleteDrop', function(data, cb)
    local result = lib.callback.await('senor-airdrops:server:DeleteDrop', false, data)
    cb(result)
end)

RegisterNUICallback('airdrops.AddPrize', function(data, cb)
    local result = lib.callback.await('senor-airdrops:server:AddPrize', false, data)
    cb(result)
end)

RegisterNUICallback('airdrops.RemovePrize', function(data, cb)
    local result = lib.callback.await('senor-airdrops:server:RemovePrize', false, data)
    cb(result)
end)

RegisterNUICallback('airdrops.EditPrize', function(data, cb)
    local result = lib.callback.await('senor-airdrops:server:EditPrize', false, data)
    cb(result)
end)

function OpenMenu(data, airdrops, history)
    ToggleNuiFrame(true)
    data.inventoryItems = {}
    if data.isAdmin then
        for _, value in pairs(Bridge.inventory.Items()) do
            table.insert(data.inventoryItems, value)
        end
    end

    local waypoint = utils.GetWaypointCoords()
    if waypoint then
        SendReactMessage('setWaypoint', waypoint)
    end

    SendLocaleData()
    SendReactMessage('OpenMenu', data)
    SendReactMessage('setAirdrops', airdrops)
    SendReactMessage('setHistory', history)
end
