RegisterCommand('createsquad', function(source, args, rawCommand)
    local name = args[2] or 'DefaultSquad'
    local image = args[3] or ''
    local password = args[4] or nil

    local result = lib.callback.await('squads:server:CreateSquad', false,
        { name = name, image = image, password = password })
    --lib.print.debug(result)
end, false)

RegisterCommand('joinsquad', function(source, args, rawCommand)
    local squadId = tonumber(args[1])
    local password = args[2] or nil

    local result = lib.callback.await('squads:server:JoinSquad', false, { squad = squadId, password = password })
    --lib.print.debug(result)
end, false)

RegisterCommand('removeplayer', function(source, args, rawCommand)
    local targetId = tonumber(args[1])

    local result = lib.callback.await('squads:server:RemovePlayer', false, targetId)
    --lib.print.debug(result)
end, false)

RegisterCommand('getsquads', function()
    local result = lib.callback.await('squads:server:GetSquads', false)
    --lib.print.info(result)
end, false)

RegisterCommand('message', function(source, args)
    local content = args[1]
    local result = lib.callback.await('squads:server:SendMessage', false, content)
    --lib.print.debug(result)
end, false)

RegisterCommand('mySquad', function()
    lib.print.debug(Squad)
end, false)