local PingTypes = { 'go', 'enemy', 'danger', 'loot', 'defend', 'car' }

---@type table<string, {blipColor:number, blipSprite:number}>
local PingMeta = {
    go     = { blipColor = 2,  blipSprite = 8   },
    enemy  = { blipColor = 1,  blipSprite = 161 },
    danger = { blipColor = 17, blipSprite = 156 },
    loot   = { blipColor = 5,  blipSprite = 85  },
    defend = { blipColor = 3,  blipSprite = 271 },
    car    = { blipColor = 27, blipSprite = 56  },
}

local PING_TXD = 'squad_pings'
local pingTxd  = nil

---@type boolean
local wheelOpen = false

---@type vector3 | nil
local pendingCoords = nil

---@type number | nil
local pendingEntity = nil

---@type table<number, {cancel: boolean, blip: number}>
local ActivePings = {}

local lastPingAt = 0

---@return table|nil
local function getLocalPlayer()
    if not Squad.mySquad then return nil end
    for _, p in ipairs(Squad.mySquad.players) do
        if p.serverId == cache.serverId then return p end
    end
end

local function initTextures()
    pingTxd = CreateRuntimeTxd(PING_TXD)
    for _, pingType in ipairs(PingTypes) do
        CreateRuntimeTextureFromImage(pingTxd, pingType, ('web/public/pings/%s.png'):format(pingType))
    end
end

---@param entity number
---@return number | nil
local function safeGetNetId(entity)
    if not entity or entity == 0 or not DoesEntityExist(entity) then return nil end
    if not NetworkGetEntityIsNetworked(entity) then return nil end
    local netId = NetworkGetNetworkIdFromEntity(entity)
    return (netId and netId ~= 0) and netId or nil
end

---@param hitCoords vector3
---@return number | nil entity, string autoType
local function findNearbyEntity(hitCoords)
    local radius = 3.5

    local ped, pedDist = GetClosestPed(hitCoords.x, hitCoords.y, hitCoords.z, radius, true, true, true, true, 0)
    local veh, vehDist = GetClosestVehicle(hitCoords.x, hitCoords.y, hitCoords.z, radius, 0, 71)

    local hasPed = pedDist and DoesEntityExist(ped) and ped ~= PlayerPedId()
    local hasVeh = vehDist and DoesEntityExist(veh)

    if hasPed and hasVeh then
        return pedDist <= vehDist and ped or veh, pedDist <= vehDist and 'enemy' or 'car'
    elseif hasPed then return ped, 'enemy'
    elseif hasVeh then return veh, 'car'
    end
    return nil, 'go'
end

---@param senderId number
local function cancelActivePing(senderId)
    local active = ActivePings[senderId]
    if not active then return end
    active.cancel = true
    if DoesBlipExist(active.blip) then RemoveBlip(active.blip) end
    ActivePings[senderId] = nil
end

---@param entity number
---@return number wx, number wy, number wz, vector3 groundCoords
local function getEntityIconPos(entity)
    local ec    = GetEntityCoords(entity)
    local eType = GetEntityType(entity)

    if eType == 1 then
        local boneIdx = GetPedBoneIndex(entity, 0x796e)
        if boneIdx ~= -1 then
            local head = GetPedBoneCoords(entity, boneIdx, 0.0, 0.0, 0.0)
            return ec.x, ec.y, head.z + 1.5, ec
        end
        return ec.x, ec.y, ec.z + 0.9, ec
    end

    local ok, model = pcall(GetEntityModel, entity)
    if ok and model ~= 0 then
        local _, eMax = GetModelDimensions(model)
        if eMax then return ec.x, ec.y, ec.z + eMax.z + 0.3, ec end
    end
    return ec.x, ec.y, ec.z + 1.5, ec
end

---@param pingType string
---@param data table
local function spawnPing(pingType, data)
    local meta = PingMeta[pingType]
    if not meta then return end

    cancelActivePing(data.senderId)

    local blip = AddBlipForCoord(data.coords.x, data.coords.y, data.coords.z)
    SetBlipSprite(blip, meta.blipSprite)
    SetBlipColour(blip, meta.blipColor)
    SetBlipScale(blip, 0.8)
    SetBlipAsShortRange(blip, true)
    BeginTextCommandSetBlipName('STRING')
    AddTextComponentString(('%s: %s'):format(data.senderName, locale('ping_type_' .. pingType)))
    EndTextCommandSetBlipName(blip)

    local slot = { cancel = false, blip = blip }
    ActivePings[data.senderId] = slot

    local entityHandle = nil
    if data.entityNetId then
        local e = NetworkGetEntityFromNetworkId(data.entityNetId)
        if DoesEntityExist(e) then entityHandle = e end
    end

    local isEntityPing = entityHandle ~= nil
    local ttl          = isEntityPing and Config.Settings['PingFollowingTTL'] or Config.Settings['PingTTL']
    local totalMs      = ttl * 1000
    local spawnAt      = GetGameTimer()
    local expireAt     = spawnAt + totalMs
    local fadeMs       = 200

    local aspect = GetAspectRatio(false)

    CreateThread(function()
        while not slot.cancel and GetGameTimer() < expireAt do
            local now = GetGameTimer()
            local wx, wy, wz, groundCoords

            if isEntityPing then
                if not DoesEntityExist(entityHandle) then break end
                local ec = GetEntityCoords(entityHandle)
                if not World3dToScreen2d(ec.x, ec.y, ec.z) then break end
                wx, wy, wz, groundCoords = getEntityIconPos(entityHandle)
                if DoesBlipExist(blip) then SetBlipCoords(blip, ec.x, ec.y, ec.z) end
            else
                wx, wy, wz = data.coords.x, data.coords.y, data.coords.z + 1.2
                groundCoords = data.coords
            end

            local dist  = #(GetEntityCoords(PlayerPedId()) - vector3(groundCoords.x, groundCoords.y, groundCoords.z))
            local scale = math.max(Config.Settings['PingIconMinSize'], math.min(Config.Settings['PingIconMaxSize'], Config.Settings['PingIconScale'] / math.max(dist, 1.0)))

            local fadeIn  = math.min((now - spawnAt) / fadeMs, 1.0)
            local fadeOut = math.min((expireAt - now) / fadeMs, 1.0)
            local alpha   = math.floor(math.min(fadeIn, fadeOut) * 220)

            SetDrawOrigin(wx, wy, wz, 0)
            DrawSprite(PING_TXD, pingType, 0.0, 0.0, scale, scale * aspect, 0.0, 255, 255, 255, alpha)
            ClearDrawOrigin()

            Wait(0)
        end

        if not slot.cancel then
            if DoesBlipExist(blip) then RemoveBlip(blip) end
            if ActivePings[data.senderId] == slot then ActivePings[data.senderId] = nil end
        end
    end)
end

---@param hit boolean
---@param entityHit number
---@param coords vector3
---@param defaultType string
---@return vector3, number | nil, string
local function resolveRaycast(hit, entityHit, coords, defaultType)
    if not hit then return coords, nil, defaultType end

    local entity, autoType = findNearbyEntity(coords)

    if not entity then
        entity = (DoesEntityExist(entityHit) and GetEntityType(entityHit) ~= 0) and entityHit or nil
        if entity then
            local eType = GetEntityType(entity)
            if eType == 1 and entity ~= PlayerPedId() then autoType = 'enemy'
            elseif eType == 2 then autoType = 'car'
            else entity = nil
            end
        end
    end

    if not entity then return coords, nil, autoType end

    return GetEntityCoords(entity), safeGetNetId(entity), autoType
end

---@param pingType string
---@param coords vector3
---@param entityNetId number | nil
local function firePing(pingType, coords, entityNetId)
    if not Squad.mySquad then return end
    local now = GetGameTimer()
    if (now - lastPingAt) < Config.Settings['PingCooldownMs'] then return end
    lastPingAt = now
    TriggerServerEvent('squad:server:Ping', pingType, { x = coords.x, y = coords.y, z = coords.z }, entityNetId)
end

local pressedAt     = 0
local holdTriggered = false

local pingKeybind = lib.addKeybind({
    name          = 'squad_ping',
    description   = 'Squad Ping',
    defaultKey    = 'MOUSE_MIDDLE',
    defaultMapper = 'MOUSE_BUTTON',

    onPressed = function(self)
        if not Config.Settings['Pings'] then return end
        local me = getLocalPlayer()
        if not me or me.isDead then return end

        pressedAt     = GetGameTimer()
        holdTriggered = false

        CreateThread(function()
            while self:isControlPressed() do
                if not holdTriggered and (GetGameTimer() - pressedAt) >= Config.Settings['PingHoldMs'] then
                    holdTriggered = true
                    local hit, entityHit, coords = lib.raycast.fromCamera(511, 4, 500)
                    local finalCoords, netId = resolveRaycast(hit, entityHit, coords, 'go')
                    pendingCoords = finalCoords
                    pendingEntity = netId
                    wheelOpen     = true
                    SetNuiFocus(true, true)
                    SendReactMessage('openPingWheel', {})
                end
                Wait(0)
            end
        end)
    end,

    onReleased = function()
        if not Config.Settings['Pings'] or wheelOpen or holdTriggered then return end
        local me = getLocalPlayer()
        if not me or me.isDead then return end
        local hit, entityHit, coords = lib.raycast.fromCamera(511, 4, 500)
        local finalCoords, netId, autoType = resolveRaycast(hit, entityHit, coords, 'go')
        if hit then firePing(autoType, finalCoords, netId) end
    end,
})

RegisterNUICallback('pingSelected', function(data, cb)
    wheelOpen = false
    SetNuiFocus(false, false)
    local coords, netId = pendingCoords, pendingEntity
    pendingCoords, pendingEntity = nil, nil
    if data and data.type and coords then firePing(data.type, coords, netId) end
    cb({})
end)

RegisterNUICallback('closePingWheel', function(_, cb)
    wheelOpen, pendingCoords, pendingEntity = false, nil, nil
    SetNuiFocus(false, false)
    cb({})
end)

RegisterNetEvent('squad:client:PingReceived')
AddEventHandler('squad:client:PingReceived', function(data)
    if not Config.Settings['Pings'] then return end
    data.coords = vector3(data.coords.x, data.coords.y, data.coords.z)
    if Config.Settings['PingNotify'] then
        lib.notify({
            title       = data.senderName,
            description = locale('ping_type_' .. (data.type or 'go')),
            type        = 'inform',
            duration    = Config.Settings['PingNotifyDuration'],
            position    = Config.Settings['PingNotifyPosition'],
        })
    end
    if Config.Settings['PingSound'] then
        PlaySoundFrontend(-1, Config.Settings['PingSoundName'], Config.Settings['PingSoundSet'], true)
    end
    spawnPing(data.type, data)
end)

AddEventHandler('onResourceStop', function(resourceName)
    if GetCurrentResourceName() ~= resourceName then return end
    for senderId in pairs(ActivePings) do cancelActivePing(senderId) end
end)

CreateThread(function()
    if Config.Settings['Pings'] then initTextures() end
end)
