lib.addCommand(Config.Commands.admin, {
    help = locale('command_help'),
}, function(source)
    if not Bridge.framework.IsAdmin(source) then return end
    local zones = Manager.GetZones(true)
    TriggerClientEvent('redzone:client:openAdmin', source, zones)
end)
