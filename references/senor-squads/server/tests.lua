-- local squad = require 'server.class'

-- AddEventHandler('onResourceStart', function(resourceName)
--     if (GetCurrentResourceName() ~= resourceName) then
--         return
--     end
    
--     for k,v in pairs(GetPlayers()) do
--         if k == 1 then
--             squad:new({playerId = k, name = 'Senor Auto', image = '', password = nil})
--         end
--         Wait(0)

--         if k == 2 then
--             local SquadInstance = GetPlayerSquad(1)
--             SquadInstance.squad:AddPlayer(k, false, nil)
--         end
--     end
-- end)

-- CreateThread(function()
--     local f = squad:new({playerId = 1, name = 'Senor', image = '', password = '123'})
--     lib.print.debug(f.squadId)
-- end)

-- RegisterCommand('createsquad', function(source, args, rawCommand)
--     local playerId = tonumber(args[1]) or source
--     local name = args[2] or 'DefaultSquad'
--     local image = args[3] or ''
--     local password = args[4] or nil

--     local newSquad = squad:new({playerId = playerId, name = name, image = image, password = password})
--     lib.print.debug(newSquad)
-- end, false)

-- RegisterCommand('addplayer', function(source, args, rawCommand)
--     local squadId = tonumber(args[1])
--     local playerId = tonumber(args[2])
--     local password = args[3] or nil

--     local SquadInstance = GetSquad(squadId)
--     if not SquadInstance then
--         return lib.print.debug('Squad not found')
--     end

--     lib.print.debug(SquadInstance:AddPlayer(playerId, false, password))
-- end, false)

-- RegisterCommand('removeplayer', function(source, args, rawCommand)
--     local squadId = tonumber(args[1])
--     local playerId = tonumber(args[2])
--     local ignoreOwner = args[3] == 'true'
--     local initiator = source

--     local SquadInstance = GetSquad(squadId)
--     if not SquadInstance then
--         return lib.print.debug('Squad not found')
--     end

--     lib.print.debug(SquadInstance:RemovePlayer(playerId, ignoreOwner, initiator))
-- end, false)

-- RegisterCommand('getsquad', function(source, args, rawCommand)
--     local squadId = tonumber(args[1])

--     local SquadInstance = GetSquad(squadId)
--     if not SquadInstance then
--         return lib.print.debug('Squad not found')
--     end

--     lib.print.debug(SquadInstance:GetPlayers())
-- end, false)

-- RegisterCommand('deletesquad', function(source, args, rawCommand)
--     local squadId = tonumber(args[1])

--     local SquadInstance = GetSquad(squadId)
--     if not SquadInstance then
--         return lib.print.debug('Squad not found')
--     end

--     SquadInstance:RemoveSquad()
--     lib.print.debug('Squad deleted successfully')
-- end, false)

-- RegisterCommand('getsquads', function(source, args, rawCommand)
--     lib.print.debug(Squads)
-- end, false)

-- RegisterCommand('getplayers', function(source, args, rawCommand)
--     lib.print.debug(Players)
-- end, false)
