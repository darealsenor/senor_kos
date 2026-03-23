-- Wait(1000)
-- local QBCore = exports['qb-core']:GetCoreObject()
-- local squad = require 'server.class'

-- local function removePlayer(playerId)
--     local playerSquad = GetPlayerSquad(playerId)
--     if not playerSquad.success then return lib.print.debug('player didnt have any squad to being with') end

--     playerSquad.squad:RemovePlayer(playerId, true, nil)
--     return lib.print.debug('player removed from squad')
-- end

-- local function GangHandler(playerId)
--     local player = QBCore.Functions.GetPlayer(playerId)
--     if not player then return end

--     removePlayer(playerId)

--     local playerGang = player.PlayerData.gang.name
--     if playerGang == 'none' then return end

--     local isInSquad = GetPlayerSquad(playerId)
--     if isInSquad.success then return end

--     local doesSquadExists = GetSquadByName(playerGang)

--     if not doesSquadExists.success then
--         CreateSquad({
--             playerId = playerId,
--             name = playerGang,
--             password = math.random(11111, 999999),
--             maxplayers = 20,
--         })
--         return
--     end

--     if doesSquadExists.data then
--         doesSquadExists.data:AddPlayer(playerId, true, nil)
--         return
--     end
-- end

-- CreateThread(function()
--     for k, v in pairs(QBCore.Functions.GetQBPlayers()) do
--         GangHandler(v.PlayerData.source)
--     end
-- end)


-- AddStateBagChangeHandler("bucket", nil, function(bagName, key, value)
--     local playerIdString = bagName:gsub('player:', '')
--     local playerId = tonumber(playerIdString)
--     if not playerId then return end

--     if value ~= 0 and (value < 300 or value > 400) then
--         removePlayer(playerId)
--         return
--     end

--     GangHandler(playerId)
-- end)

-- RegisterNetEvent('QBCore:Server:OnGangUpdate')
-- AddEventHandler('QBCore:Server:OnGangUpdate', GangHandler)

-- RegisterNetEvent('squads:server:playerLoaded')
-- AddEventHandler('squads:server:playerLoaded', GangHandler)

-- RegisterNetEvent('joinGangSquad')
-- AddEventHandler('joinGangSquad', function()
--     local src = source
--     GangHandler(src)
-- end)
