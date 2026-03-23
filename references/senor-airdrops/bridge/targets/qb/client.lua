-- This bridge makes qb-target work the same way as ox_target, basically to use the bridge refer to the ox_target docs it's the exact same: https://overextended.dev/ox_target
-- AddComboZone, AddTargetBone, AddEntityZone; is not bridged, very useless and not worth using.

local target = {}
local spheres = {}
local qb_target = exports["qb-target"]
local zonesCreated = {}

local function getEntitiesFromNetIds(netIds)
    if type(netIds) == "number" then
        return NetworkGetEntityFromNetworkId(netIds)
    end
    
    local entities = {}

    for i=1, #netIds do
        entities[i] = NetworkGetEntityFromNetworkId(netIds[i])
    end

    return entities
end

local function normalizeOptions(options)
    if type(options) == 'table' and not options[1] and options.label then
        return {options}
    end
    return options
end

local function getFurthestOptionDistance(options)
    local furthest = 0
    for i=1, #options do
        local opt = options[i]
        local distance = opt.distance or 2.0
        if distance > furthest then
            furthest = distance
        end
    end
    return furthest
end

local function getMidpoint(coord1, coord2)
    local midpoint = vector3(
        (coord1.x + coord2.x) / 2,
        (coord1.y + coord2.y) / 2,
        (coord1.z + coord2.z) / 2
    )
    return midpoint
end

local function mergeCloseSpheres(param)
    for name, sphere in pairs(spheres) do
        if #(sphere.coords - param.coords) < 1 then
            for i=1, #sphere.options do
                local option = sphere.options[i]
                param.options[#param.options+1] = option
            end
            
            for i=1, #param.options do
                local option = param.options[i]
                option.num = i
            end

            for i=1, #zonesCreated do
                if zonesCreated[i] == sphere.name then
                    table.remove(zonesCreated, i)
                end
            end

            param.coords = getMidpoint(sphere.coords, param.coords)
            qb_target:RemoveZone(sphere.name)
            spheres[name] = nil

        end
    end
    
    spheres[param.name] = param
end

local function tweakOptions(options)
    for i=1, #options do
        local option = options[i]

        option.num = i
        option.item = option.items
        option.distance = option.distance or 2.0

        local event = option.event
        if event then
            option.event = nil
        end

        -- Note: might need more stuff inside data tho.
        if option.onSelect then
            option.action = function(entity)
                local entityCoords = GetEntityCoords(entity)
                local playerCoords = GetEntityCoords(PlayerPedId())
                local data = {}
        
                data.entity = entity
                data.coords = entityCoords
                data.distance = #(entityCoords-playerCoords)

                if option.export then
                    -- todo
                end
                if event then
                    -- todo
                end
                if option.serverEvent then
                    -- todo
                end
                if option.command then
                    -- todo
                end
        
                return option.onSelect(data)
            end
        end

        if option.canInteract then            
            option._canInteract = option.canInteract
            option.canInteract = function(entity, distance, data)
                local coords = GetEntityCoords(cache.ped)
                local name = option.name or option.label or ""
                local bone = nil
                --[[@diagnostic disable-next-line: param-type-mismatch]]
                return option._canInteract(entity, distance, coords, name, bone)
            end
        else
            option.canInteract = function(entity, distance, data)
                return true
            end
        end
    end

    return options
end

function target.disableTargeting(state)
    qb_target:AllowTargeting(not state)
end

-- Note: Could create a workaround for global options, they're basically options that just show up without having to target anything.
-- Note: The workaround could be to spawn an invisible object infront of the ped target and add the option to it.
function target.addGlobalOption(options)
    print("addGlobalOption not supported yet for qb-target")
end

function target.removeGlobalOption(optionNames)
    print("removeGlobalOption not supported yet for qb-target")
end

function target.addGlobalObject(options)
    local distance = getFurthestOptionDistance(options)
    local newOptions = tweakOptions(options)

    qb_target:AddGlobalObject({
        options = newOptions,
        distance = distance
    })
end

function target.removeGlobalObject(optionNames)
    qb_target:RemoveGlobalObject(optionNames)
end

function target.addGlobalPed(options)
    local distance = getFurthestOptionDistance(options)
    local newOptions = tweakOptions(options)

    qb_target:AddGlobalPed({
        options = newOptions,
        distance = distance
    })
end

function target.removeGlobalPed(optionNames)
    qb_target:RemoveGlobalPed(optionNames)
end

function target.addGlobalPlayer(options)
    local distance = getFurthestOptionDistance(options)
    local newOptions = tweakOptions(options)

    qb_target:AddGlobalPlayer({
        options = newOptions,
        distance = distance
    })
end

function target.removeGlobalPlayer(optionNames)
    qb_target:RemoveGlobalPlayer(optionNames)
end

function target.addGlobalVehicle(options)
    local distance = getFurthestOptionDistance(options)
    local newOptions = tweakOptions(options)

    qb_target:AddGlobalVehicle({
        options = newOptions,
        distance = distance
    })
end

function target.removeGlobalVehicle(optionNames)
    qb_target:RemoveGlobalVehicle(optionNames)
end

function target.addModel(models, options)
    local distance = getFurthestOptionDistance(options)
    local newOptions = tweakOptions(options)

    qb_target:AddTargetModel(models, {
        options = newOptions,
        distance = distance
    })
end

function target.removeModel(models, optionNames)
    qb_target:RemoveTargetModel(models, optionNames)
end

-- todo: not sure how it will work with networked entities, might have to create a global and just check can interact for netids. If this doesn't work!
function target.addEntity(netIds, options)
    local distance = getFurthestOptionDistance(options)
    local newOptions = tweakOptions(options)
    local entities = getEntitiesFromNetIds(netIds)

    qb_target:AddTargetEntity(entities, {
        options = newOptions,
        distance = distance,
    })
end

-- todo: same here!
function target.removeEntity(netIds, optionNames)
    local entities = getEntitiesFromNetIds(netIds)
    qb_target:RemoveTargetEntity(entities, optionNames)
end

function target.addLocalEntity(entities, options)
    options = normalizeOptions(options)
    local distance = getFurthestOptionDistance(options)
    local newOptions = tweakOptions(options)

    qb_target:AddTargetEntity(entities, {
        options = newOptions,
        distance = distance,
    })
end

function target.removeLocalEntity(entities, optionNames)
    qb_target:RemoveTargetEntity(entities, optionNames)
end

function target.addSphereZone(parameters)
    local options = parameters.options
    local distance = getFurthestOptionDistance(options)
    local newOptions = tweakOptions(options)
    mergeCloseSpheres(parameters)

    qb_target:AddCircleZone(
        parameters.name,
        parameters.coords,
        parameters.radius,
        { name = parameters.name, debugPoly = parameters.debug },
        { options = newOptions, distance = distance }
    )

    local id = #zonesCreated+1
    zonesCreated[id] = parameters.name
    return id
end

function target.addBoxZone(parameters)
    local options = parameters.options
    local distance = getFurthestOptionDistance(options)
    local newOptions = tweakOptions(options)

    qb_target:AddBoxZone(parameters.name, parameters.coords, parameters.size.x, parameters.size.y,
        {
            name = parameters.name,
            heading = parameters.rotation,
            debugPoly = parameters.debug,
            minZ = parameters.coords.z - (parameters.size.z or 2) / 2,
            maxZ = parameters.coords.z + (parameters.size.z or 2) / 2
        },
        {
            options = newOptions,
            distance = distance
        }
    )

    local id = #zonesCreated+1
    zonesCreated[id] = parameters.name
    return id
end

function target.addPolyZone(parameters)
    local options = parameters.options
    local distance = getFurthestOptionDistance(options)
    local newOptions = tweakOptions(options)

    local points = {}
    local minZ = parameters.points[1].z
    for _, point in ipairs(parameters.points) do
        table.insert(points, vector2(point.x, point.y))
        if point.z < minZ then minZ = point.z end
    end

    local maxZ = minZ + (parameters.thickness or 4)

    qb_target:AddPolyZone(
        parameters.name,
        points,
        {
            name = parameters.name,
            debugPoly = parameters.debug,
            minZ = minZ,
            maxZ = maxZ,
        },
        {
            options = newOptions,
            distance = distance
        }
    )

    local id = #zonesCreated + 1
    zonesCreated[id] = parameters.name
    return id
end

function target.removeZone(id)
    local name = zonesCreated[id]
    if not name then return end
    qb_target:RemoveZone(name)
end

return target