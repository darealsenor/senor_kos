local path = ('locales.%s'):format(Shared.Language)
local locales = lib.loadJson(path)

RegisterNUICallback('hideFrame', function(_, cb)
  ToggleNuiFrame(false)
  -- debugPrint('Hide NUI frame')
  cb({})
end)

RegisterNUICallback('nuiLoaded', function(_, cb)
  SendReactMessage('setDesignConfig', Config.Design)
  SendReactMessage('setLocale', locales)
  SendReactMessage('setPlayerId', cache.serverId)
  SendReactMessage('MaximumSquadPlayers', Shared.MaximumSquadPlayers)
  SendReactMessage('setDefaultSettings', Config.DefaultSettings or {})
end)

RegisterNuiCallback('createSquad', function(data, cb)
  local createSquad = lib.callback.await('squads:server:CreateSquad', false, data)
  lib.print.debug(data)
  cb(createSquad)
end)

RegisterNuiCallback('LeaveSquad', function(data, cb)
  local result = lib.callback.await('squads:server:LeaveSquad', false)
  cb(result.success)
end)

RegisterNuiCallback('sendMessage', function(data, cb)
  local result = lib.callback.await('squads:server:SendMessage', false, data.message)
  cb(result)
end)

RegisterNuiCallback('newSettings', function(Settings, cb)
    Squad.Settings = Settings
    StartSquadFunctions(false)

    if Squad.mySquad then
        StartSquadFunctions(true)
    end
    cb(1)
end)

RegisterNuiCallback('JoinSquad', function(data, cb)
  local result = lib.callback.await('squads:server:JoinSquad', false,
  { squad = data.squad.squadId, password = data.password })
  cb(result)
end)

RegisterNuiCallback('RemovePlayer', function(serverId, cb)
  local result = lib.callback.await('squads:server:RemovePlayer', false, serverId)
  cb(result)
end)

RegisterNuiCallback('TransferOwnership', function(targetId, cb)
  local result = lib.callback.await('squads:server:TransferOwnership', false, targetId)
  cb(result)
end)

RegisterNuiCallback('ForceCloseSquad', function(_, cb)
  local result = lib.callback.await('squads:server:ForceCloseSquad', false)
  cb(result)
end)

RegisterNuiCallback('isNameValid', function(squadName, cb)
  local result = lib.callback.await('isNameValid', false, squadName)
  cb(result)
end)

RegisterNuiCallback('GetSquads', function(_, cb)
  local result = lib.callback.await('squads:server:GetSquads', false)
  cb(result)
end)

RegisterNUICallback('squads:server:EditSquad', function(data, cb)
    local retval = lib.callback.await('squads:server:EditSquad', false, data)
    cb(retval)
end)

lib.callback.register('squads:client:GetHudPosition', function(source)
    if Squad.Settings and Squad.Settings.HudPosition and type(Squad.Settings.HudPosition.x) == 'number' and type(Squad.Settings.HudPosition.y) == 'number' then
        return Squad.Settings.HudPosition
    end
    return { x = 0, y = 0 }
end)

RegisterNetEvent('squads:client:CopyHudPosition', function(positionString)
    lib.setClipboard(positionString)
    lib.notify({
        title = locale('cmd_hud_position_title'),
        description = locale('cmd_hud_position_copied'),
        type = 'success'
    })
end)

RegisterNetEvent('squads:client:resetSettings', function()
    SendReactMessage('resetSettings', {})
end)