--[[
    Note from script developer: this feature was
    intended to use on my own server, you can either ignore this file
    or implement it by yourself, its pretty much irrelveant.
]]

--  I included the disarm though cause  why not i guess
local function disarm(coords, distance, message)
    local playersInRange = lib.getNearbyPlayers(vector3(coords.x, coords.y, coords.z), distance + 0.0)
    for k, v in each(playersInRange) do
        Bridge.notify.Notify(v.id, {
            id = 'Airdrop',
            title = locale('notification_winner_title'),
            description = message or locale('notification_winner_picked_up'),
            position = 'bottom',
            duration = 10000,
            icon = 'parachute-box',
        })
        --   I don't think qb-inventory has a disarm option so I don't care abt adding this to the bridge .!.
        TriggerClientEvent('ox_inventory:disarm', v.id, true)
    end
end

-- local QBCore = exports['qb-core']:GetCoreObject()
-- local utils = require 'server.utils.utils'

-- local function hextorgb(hex)
--     hex = hex:gsub("#", "")
--     local r = tonumber(hex:sub(1, 2), 16)
--     local g = tonumber(hex:sub(3, 4), 16)
--     local b = tonumber(hex:sub(5, 6), 16)
--     return { r = r, g = g, b = b }
-- end

-- local function GetGangPlayersByName(name)
--     local Players = QBCore.Functions.GetQBPlayers()

--     local gangPlayers = {}
--     for k, v in pairs(Players) do
--         if v.PlayerData.gang.name == name then
--             gangPlayers[#gangPlayers + 1] = v.PlayerData.source
--         end
--     end

--     return gangPlayers
-- end


-- local function GlowBagsandNotify(coords, playerId, distance)
--     local player = QBCore.Functions.GetPlayer(playerId)
--     if not player then return end

--     local playersInRange = lib.getNearbyPlayers(vector3(coords.x, coords.y, coords.z), distance + 0.0)
--     local gang = player.PlayerData.gang
--     local hasGang = gang and gang.name ~= 'none'
--     local GangLabel = hasGang and player.PlayerData.gang.label or 'Solo Crime'
--     local gangColor = QBCore.Shared.Gangs[gang.name].colorhex or '808080'
--     local rgb = hextorgb(gangColor)
--     local msg = ('%s (%s) has picked up the drop! airdrof is over - dont shoot'):format(
--         GetPlayerName(playerId), GangLabel)
--     local gangPlayers = hasGang and GetGangPlayersByName(gang.name) or { playerId }
--     local eloAmount = math.floor(250 / #gangPlayers)

--     local enoughPlayers = utils.EnoughPlayers()

--     for k, v in pairs(gangPlayers) do
--         TriggerClientEvent('kaves_airdrop:client:winner', v, rgb)
--         if GetResourceState('senor-stats-ts') == 'started' and enoughPlayers then
--             pcall(function()
--                 exports['senor-stats-ts']:SetElo(v, eloAmount)
--                 return true
--             end)
--         end
--     end


--     for k, v in each(playersInRange) do
--         -- if Player(v.id).state.bucket == 0 then
--         TriggerClientEvent('kaves_airdrop:client:GlowingBags', v.id, coords, rgb)
--         TriggerClientEvent('ox_lib:notify', v.id, {
--             id = 'Airdrop',
--             title = 'Airdrop - Winner',
--             description = msg,
--             position = 'bottom',
--             duration = 10000,
--             icon = 'parachute-box',
--             style = {
--                 backgroundColor = ('#%s'):format(gangColor),
--             },
--         })
--         TriggerClientEvent('ox_inventory:disarm', v.id, true)
--         -- end
--     end

--     return true
-- end

return {
    --     GlowBagsandNotify = GlowBagsandNotify
    disarm = disarm
}
