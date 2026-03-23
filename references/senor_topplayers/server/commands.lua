lib.addCommand(Config.commands.savestats.name, {
    help = locale('cmd_savestats_help'),
    params = {},
    restricted = Config.commands.savestats.restricted,
}, function(source, _, _)
    saveAllCachedPlayers()
    TriggerClientEvent('ox_lib:notify', source, { type = 'success', description = locale('cmd_savestats_done') })
end)