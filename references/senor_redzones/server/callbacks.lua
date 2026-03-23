lib.callback.register('redzone:server:getZones', function(source)
    if not Bridge.framework.IsAdmin(source) then
        return { success = false, zones = {} }
    end
    local zones = Manager.GetZones(true)
    return { success = true, zones = zones }
end)

lib.callback.register('redzone:server:createZone', function(source, data)
    if not Bridge.framework.IsAdmin(source) then
        return { success = false, error = locale('unauthorized') }
    end
    if not data or not data.name or not data.coords or not data.radius then
        return { success = false, error = locale('missing_fields') }
    end
    local minR = type(Config.minRadius) == 'number' and Config.minRadius or 10
    local maxR = type(Config.maxRadius) == 'number' and Config.maxRadius or 500
    local radius = tonumber(data.radius)
    if not radius or radius < minR or radius > maxR then
        return { success = false, error = locale('radius_range') }
    end
    local zoneType = data.type == 'temporary' and 'temporary' or 'permanent'
    local payload = {
        name = data.name,
        coords = data.coords,
        radius = radius,
        bucket = tonumber(data.bucket) or 0,
        durationType = data.durationType,
        duration = data.durationType and tonumber(data.duration) or 0,
        loadout = data.loadout or {},
        killstreaks = data.killstreaks or {},
        blipName = data.blipName,
        blipColour = data.blipColour or Config.blipColour,
        markerColour = data.markerColour or Config.markerColour,
        enabled = data.enabled ~= false,
        spawnPoints = data.spawnPoints or {},
        autoRevive = data.autoRevive ~= false,
    }
    local ok, zone = pcall(function()
        if zoneType == 'temporary' then return Manager.CreateTemporaryZone(payload) end
        return Manager.CreatePermanentZone(payload)
    end)
    if not ok then
        return { success = false, error = tostring(zone) }
    end
    Logger.logZoneAction(source, 'RedzoneCreate', ('Created zone "%s" (id %s)'):format(zone.name, zone.id), 'Redzone created')
    return { success = true, zone = zone:get() }
end)

lib.callback.register('redzone:server:updateZone', function(source, data)
    if not Bridge.framework.IsAdmin(source) then
        return { success = false, error = locale('unauthorized') }
    end
    if not data or not data.id then
        return { success = false, error = locale('missing_fields') }
    end
    local zone = Manager.GetZoneById(data.id)
    if not zone then
        return { success = false, error = locale('zone_not_found') }
    end
    local updateData = {}
    if data.name ~= nil then updateData.name = data.name end
    if data.coords ~= nil then updateData.coords = data.coords end
    if data.radius ~= nil then updateData.radius = tonumber(data.radius) end
    if data.bucket ~= nil then updateData.bucket = tonumber(data.bucket) end
    if data.durationType ~= nil then updateData.durationType = data.durationType end
    if data.duration ~= nil then updateData.duration = tonumber(data.duration) end
    if data.loadout ~= nil then updateData.loadout = data.loadout end
    if data.killstreaks ~= nil then updateData.killstreaks = data.killstreaks end
    if data.spawnPoints ~= nil then updateData.spawnPoints = data.spawnPoints end
    if data.autoRevive ~= nil then updateData.autoRevive = data.autoRevive end
    if data.blipName ~= nil then updateData.blipName = data.blipName end
    if data.blipColour ~= nil then updateData.blipColour = data.blipColour end
    if data.markerColour ~= nil then updateData.markerColour = data.markerColour end
    if data.enabled ~= nil and zone.type == 'permanent' then updateData.enabled = data.enabled end
    local minR = type(Config.minRadius) == 'number' and Config.minRadius or 10
    local maxR = type(Config.maxRadius) == 'number' and Config.maxRadius or 500
    local radiusNum = updateData.radius
    if radiusNum and (radiusNum < minR or radiusNum > maxR) then
        return { success = false, error = locale('radius_range') }
    end
    local ok, result = pcall(function()
        return Manager.UpdateZone(zone, updateData)
    end)
    if not ok then
        return { success = false, error = tostring(result) }
    end
    if not result then
        return { success = false, error = locale('update_failed') }
    end
    Logger.logZoneAction(source, 'RedzoneUpdate', ('Updated zone "%s" (id %s)'):format(zone.name, zone.id), 'Redzone updated')
    return { success = true, zone = zone:get() }
end)

lib.callback.register('redzone:server:deleteZone', function(source, data)
    if not Bridge.framework.IsAdmin(source) then
        return { success = false, error = locale('unauthorized') }
    end
    if not data or not data.id then
        return { success = false, error = locale('missing_fields') }
    end
    local zone = Manager.GetZoneById(data.id)
    if not zone then
        return { success = false, error = locale('zone_not_found') }
    end
    if zone.type == 'permanent' then
        MySQL.query.await('DELETE FROM redzones WHERE id = ?', { zone.id })
    end
    Logger.logZoneAction(source, 'RedzoneDelete', ('Deleted zone "%s" (id %s)'):format(zone.name, zone.id), 'Redzone deleted')
    Manager.RemoveZone(zone)
    return { success = true }
end)

lib.callback.register('redzone:server:getPresets', function(source)
    if not Bridge.framework.IsAdmin(source) then
        return { success = false, presets = {}, error = locale('unauthorized') }
    end
    local rows = MySQL.query.await('SELECT id, name, data FROM redzone_presets ORDER BY name ASC') or {}
    local presets = {}
    for i = 1, #rows do
        local row = rows[i]
        local decoded = type(row.data) == 'string' and json.decode(row.data) or row.data
        presets[#presets + 1] = { id = row.id, name = row.name, data = decoded or {} }
    end
    return { success = true, presets = presets }
end)

lib.callback.register('redzone:server:createPreset', function(source, data)
    if not Bridge.framework.IsAdmin(source) then
        return { success = false, error = locale('unauthorized') }
    end
    if not data or not data.name or type(data.name) ~= 'string' or #data.name:gsub('%s+', '') == 0 then
        return { success = false, error = locale('preset_name_required') }
    end
    local presetData = {
        bucket = data.bucket or 0,
        durationType = data.durationType,
        duration = data.duration or 0,
        loadout = data.loadout or {},
        killstreaks = data.killstreaks or {},
        blipColour = data.blipColour or Config.blipColour,
        markerColour = data.markerColour or Config.markerColour,
        spawnPoints = data.spawnPoints or {},
        autoRevive = data.autoRevive ~= false,
    }
    local id = MySQL.insert.await('INSERT INTO redzone_presets (name, data) VALUES (?, ?)', {
        data.name:gsub('%s+', ' '):match('^%s*(.-)%s*$'),
        json.encode(presetData),
    })
    if not id then
        return { success = false, error = 'Failed to create preset' }
    end
    return { success = true, preset = { id = id, name = data.name, data = presetData } }
end)

lib.callback.register('redzone:server:deletePreset', function(source, data)
    if not Bridge.framework.IsAdmin(source) then
        return { success = false, error = locale('unauthorized') }
    end
    if not data or not data.id then
        return { success = false, error = locale('preset_id_required') }
    end
    MySQL.query.await('DELETE FROM redzone_presets WHERE id = ?', { data.id })
    return { success = true }
end)
