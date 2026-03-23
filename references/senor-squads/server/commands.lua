lib.addCommand('squads:hud_position', {
    help = locale('cmd_hud_position_help'),
    restricted = ServerConfig.AdminCommandPermission or 'group.admin'
}, function(source, args, raw)
    local playerName = GetPlayerName(source)
    
    if not playerName then
        lib.notify(source, {
            title = locale('cmd_hud_position_title'),
            description = locale('cmd_hud_position_player_not_found'),
            type = 'error'
        })
        return
    end
    
    local hudPosition = lib.callback.await('squads:client:GetHudPosition', source, false)
    
    if hudPosition and type(hudPosition.x) == 'number' and type(hudPosition.y) == 'number' then
        local positionString = ('{ x = %.2f, y = %.2f }'):format(hudPosition.x, hudPosition.y)
        local displayString = ('X=%.2f, Y=%.2f'):format(hudPosition.x, hudPosition.y)
        
        lib.notify(source, {
            title = locale('cmd_hud_position_title'),
            description = locale('cmd_hud_position_success', hudPosition.x, hudPosition.y),
            type = 'success',
            duration = 10000
        })
        lib.print.debug(('Player %s (%d) HUD Position: %s'):format(playerName, source, displayString))
        
        TriggerClientEvent('squads:client:CopyHudPosition', source, positionString)
    else
        lib.notify(source, {
            title = locale('cmd_hud_position_title'),
            description = locale('cmd_hud_position_error'),
            type = 'error'
        })
    end
end)

lib.addCommand('squads:reset_settings', {
    help = locale('cmd_reset_settings_help'),
    restricted = ServerConfig.AdminCommandPermission or 'group.admin'
}, function(source, args, raw)
    local adminName = GetPlayerName(source)
    
    lib.notify(source, {
        title = locale('cmd_reset_settings_title'),
        description = locale('cmd_reset_settings_resetting'),
        type = 'info'
    })
    
    lib.print.debug(('Admin %s (%d) reset all players\' squad settings'):format(adminName, source))
    
    TriggerClientEvent('squads:client:resetSettings', -1)
    
    lib.notify(source, {
        title = locale('cmd_reset_settings_title'),
        description = locale('cmd_reset_settings_success'),
        type = 'success'
    })
end)

