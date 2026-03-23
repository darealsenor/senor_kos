local function serializePed(ped)
    local c = ped.coords
    return {
        id = ped.id,
        coords = { x = c.x, y = c.y, z = c.z, w = c.w or 0 },
        category = ped.category,
        categoryRanking = ped.categoryRanking,
        text = ped.text,
        label = ped.label,
        identifier = ped.identifier,
        enabled = ped.enabled,
        animation = ped.animation,
    }
end

local function serializeProp(prop)
    local c = prop.coords
    return {
        id = prop.id,
        coords = { x = c.x, y = c.y, z = c.z, w = c.w or 0 },
        prop = prop.prop,
        label = prop.label,
        enabled = prop.enabled,
    }
end

local function serializedPedsAndProps()
    local peds = LoadPeds()
    local props = LoadProps()
    local serializedPeds = {}
    for _, p in ipairs(peds) do serializedPeds[#serializedPeds + 1] = serializePed(p) end
    local serializedProps = {}
    for _, p in ipairs(props) do serializedProps[#serializedProps + 1] = serializeProp(p) end
    return serializedPeds, serializedProps
end

local function sendAdminOpen(source)
    local serializedPeds, serializedProps = serializedPedsAndProps()
    TriggerClientEvent('senor_topplayers:admin:open', source, {
        peds = serializedPeds,
        props = serializedProps,
        propList = Config.propList or {},
        animPresets = Config.pedAnimations or {},
    })
end

lib.addCommand(Config.commands.admin.name, {
    help = locale('cmd_admin_help'),
    restricted = Config.commands.admin.restricted,
}, function(source, _args, _raw)
    if not Bridge.framework.IsAdmin(source) then return end
    sendAdminOpen(source)
end)

lib.callback.register('senor_topplayers:admin:savePed', function(source, data)
    if not Bridge.framework.IsAdmin(source) then
        return { success = false, error = 'unauthorized' }
    end
    if not data or not data.coords then
        return { success = false, error = 'invalid_data' }
    end
    local coords = data.coords
    local vec = vector4(tonumber(coords.x) or 0, tonumber(coords.y) or 0, tonumber(coords.z) or 0, tonumber(coords.w) or 0)
    local saveData = {
        coords = vec,
        category = data.category,
        categoryRanking = data.categoryRanking,
        text = data.text,
        label = data.label,
        identifier = data.identifier,
        enabled = data.enabled,
        animation = data.animation,
    }
    local id = (data.id ~= nil or data['id'] ~= nil) and tonumber(data.id or data['id']) or nil
    local resultId = SavePed(saveData, id)
    if not resultId then
        return { success = false, error = 'save_failed' }
    end
    InvalidatePodiumCache()
    TriggerClientEvent('senor_topplayers:client:setPodiums', -1, GetCachedPodiums())
    local serializedPeds, serializedProps = serializedPedsAndProps()
    return { success = true, id = resultId, peds = serializedPeds, props = serializedProps }
end)

lib.callback.register('senor_topplayers:admin:saveProp', function(source, data)
    if not Bridge.framework.IsAdmin(source) then
        return { success = false, error = 'unauthorized' }
    end
    if not data or not data.coords then
        return { success = false, error = 'invalid_data' }
    end
    local coords = data.coords
    local vec = vector4(tonumber(coords.x) or 0, tonumber(coords.y) or 0, tonumber(coords.z) or 0, tonumber(coords.w) or 0)
    local saveData = {
        coords = vec,
        prop = data.prop,
        label = data.label,
        enabled = data.enabled,
    }
    local id = (data.id ~= nil or data['id'] ~= nil) and tonumber(data.id or data['id']) or nil
    local resultId = SaveProp(saveData, id)
    if not resultId then
        return { success = false, error = 'save_failed' }
    end
    InvalidatePodiumCache()
    TriggerClientEvent('senor_topplayers:client:setPodiums', -1, GetCachedPodiums())
    local serializedPeds, serializedProps = serializedPedsAndProps()
    return { success = true, id = resultId, peds = serializedPeds, props = serializedProps }
end)

lib.callback.register('senor_topplayers:admin:deletePed', function(source, id)
    if not Bridge.framework.IsAdmin(source) then
        return { success = false, error = 'unauthorized' }
    end
    local numericId = id and tonumber(id) or nil
    if not numericId then
        return { success = false, error = 'invalid_id' }
    end
    DeletePed(numericId)
    InvalidatePodiumCache()
    TriggerClientEvent('senor_topplayers:client:setPodiums', -1, GetCachedPodiums())
    local serializedPeds, serializedProps = serializedPedsAndProps()
    return { success = true, peds = serializedPeds, props = serializedProps }
end)

lib.callback.register('senor_topplayers:admin:searchPlayers', function(source, query)
    if not Bridge.framework.IsAdmin(source) then
        return { success = false, error = 'unauthorized' }
    end
    return SearchPlayers(query)
end)

lib.callback.register('senor_topplayers:admin:deleteProp', function(source, id)
    if not Bridge.framework.IsAdmin(source) then
        return { success = false, error = 'unauthorized' }
    end
    local numericId = id and tonumber(id) or nil
    if not numericId then
        return { success = false, error = 'invalid_id' }
    end
    DeleteProp(numericId)
    InvalidatePodiumCache()
    TriggerClientEvent('senor_topplayers:client:setPodiums', -1, GetCachedPodiums())
    local serializedPeds, serializedProps = serializedPedsAndProps()
    return { success = true, peds = serializedPeds, props = serializedProps }
end)
