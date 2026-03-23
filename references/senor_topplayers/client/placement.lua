local RAYCAST_DISTANCE = Config.placement.raycastDistance
local BASE_SPEED = Config.placement.baseSpeed
local HEIGHT_SPEED = Config.placement.heightSpeed
local SPEED_MULT_HIGH = Config.placement.speedMultHigh
local SPEED_MULT_LOW = Config.placement.speedMultLow
local ROTATE_SPEED = Config.placement.rotateSpeed

local placementActive = false
local previewPed = nil
local manualOffset = vector3(0.0, 0.0, 0.0)
local heightOffset = 0.0
local pedHeading = 0.0
local playerFrozen = true
local ignoreMouseMovement = false
local lockedBasePos = nil

---@return vector3, vector3
local function getCameraVectors()
    local rot = GetGameplayCamRot(2)
    local yawRad = math.rad(rot.z)
    local forward = vector3(-math.sin(yawRad), math.cos(yawRad), 0.0)
    local right = vector3(math.cos(yawRad), math.sin(yawRad), 0.0)
    return forward, right
end

---@param x number
---@param y number
---@param z number
---@return number
local function getGroundZAt(x, y, z)
    local above = z + 5.0
    local hit, _, endCoords = GetShapeTestResult(StartShapeTestRay(x, y, above, x, y, above - 20.0, 1, 0, 0))
    if hit == 2 and endCoords then
        return endCoords.z
    end
    local ok, gz = GetGroundZFor_3dCoord(x, y, z, false)
    if ok then return gz end
    return z
end

---@return vector3
local function getRaycastPosition()
    local hit, _, endCoords = lib.raycast.fromCamera(511, 4, RAYCAST_DISTANCE)
    if hit and endCoords then
        return vector3(endCoords.x, endCoords.y, endCoords.z)
    end
    local camCoords = GetGameplayCamCoord()
    local forward = getCameraVectors()
    return camCoords + (forward * RAYCAST_DISTANCE)
end

---@return number
local function getSpeedMultiplier()
    if IsControlPressed(0, 21) then return SPEED_MULT_HIGH end
    if IsControlPressed(0, 36) then return SPEED_MULT_LOW end
    return 1.0
end

---@return vector4|nil
local function getInitialCoords()
    local pos = getRaycastPosition()
    local camRot = GetGameplayCamRot(2)
    return vector4(pos.x, pos.y, pos.z, camRot.z)
end

---@return number|nil
local function spawnPreviewPed()
    local models = PLACEMENT_PED_MODELS or { 'mp_m_freemode_01' }
    local modelName = models[math.random(#models)]
    local modelHash = type(modelName) == 'string' and joaat(modelName) or modelName
    if not lib.requestModel(modelHash, 5000) then return nil end
    local coords = getInitialCoords()
    if not coords then SetModelAsNoLongerNeeded(modelHash) return nil end
    local ped = CreatePed(5, modelHash, coords.x, coords.y, coords.z - 1.0, coords.w, false, false)
    SetModelAsNoLongerNeeded(modelHash)
    if not DoesEntityExist(ped) then return nil end
    SetPedDefaultComponentVariation(ped)
    FreezeEntityPosition(ped, true)
    SetEntityInvincible(ped, true)
    SetBlockingOfNonTemporaryEvents(ped, true)
    SetPedFleeAttributes(ped, 0, false)
    SetEntityCollision(ped, false, false)
    pedHeading = coords.w
    return ped
end

---@param modelName string
---@return number|nil
local function spawnPreviewProp(modelName)
    if not modelName or modelName == '' then return nil end
    local modelHash = joaat(modelName)
    if not lib.requestModel(modelHash, 5000) then return nil end
    local coords = getInitialCoords()
    if not coords then SetModelAsNoLongerNeeded(modelHash) return nil end
    local obj = CreateObject(modelHash, coords.x, coords.y, coords.z - 1.0, false, false, false)
    SetModelAsNoLongerNeeded(modelHash)
    if not DoesEntityExist(obj) then return nil end
    SetEntityCollision(obj, false, false)
    pedHeading = coords.w
    return obj
end

local function unfreezePlayer()
    playerFrozen = false
    SetPlayerCanUseCover(cache.playerId, true)
    if DoesEntityExist(cache.ped) then
        FreezeEntityPosition(cache.ped, false)
    end
end

local function readFinalCoordsAndEnd()
    local ped = previewPed
    if not ped or not DoesEntityExist(ped) then
        placementActive = false
        unfreezePlayer()
        SendNUIMessage({ action = 'setPlacementActive', data = false })
        toggleNuiFrame(true)
        return
    end
    local coords = GetEntityCoords(ped)
    local heading = GetEntityHeading(ped)
    placementActive = false
    previewPed = nil
    DeleteEntity(ped)
    manualOffset = vector3(0.0, 0.0, 0.0)
    heightOffset = 0.0
    ignoreMouseMovement = false
    lockedBasePos = nil
    unfreezePlayer()
    SendNUIMessage({ action = 'setPlacementActive', data = false })
    toggleNuiFrame(true)
    SendNUIMessage({
        action = 'placementResult',
        data = { x = coords.x, y = coords.y, z = coords.z, w = heading },
    })
end

local function cancelPlacement()
    if previewPed and DoesEntityExist(previewPed) then
        DeleteEntity(previewPed)
        previewPed = nil
    end
    placementActive = false
    manualOffset = vector3(0.0, 0.0, 0.0)
    heightOffset = 0.0
    ignoreMouseMovement = false
    lockedBasePos = nil
    unfreezePlayer()
    SendNUIMessage({ action = 'setPlacementActive', data = false })
    toggleNuiFrame(true)
end

AddEventHandler('onResourceStop', function(resourceName)
    if resourceName ~= GetCurrentResourceName() then return end
    if previewPed and DoesEntityExist(previewPed) then
        DeleteEntity(previewPed)
        previewPed = nil
    end
    placementActive = false
    manualOffset = vector3(0.0, 0.0, 0.0)
    heightOffset = 0.0
    ignoreMouseMovement = false
    lockedBasePos = nil
    SetPlayerCanUseCover(cache.playerId, true)
    if DoesEntityExist(cache.ped) then
        FreezeEntityPosition(cache.ped, false)
    end
end)

---@param propModel string|nil When set, spawns this prop model instead of a ped.
function StartPlacement(propModel)
    if placementActive then return end
    placementActive = true
    manualOffset = vector3(0.0, 0.0, 0.0)
    heightOffset = 0.0
    ignoreMouseMovement = false
    lockedBasePos = nil
    SendNUIMessage({ action = 'setPlacementActive', data = true })
    setNuiFocusOnly(false)
    SetPlayerCanUseCover(cache.playerId, false)
    playerFrozen = true
    FreezeEntityPosition(cache.ped, true)
    if propModel and propModel ~= '' then
        previewPed = spawnPreviewProp(propModel)
    else
        previewPed = spawnPreviewPed()
    end
    if not previewPed or not DoesEntityExist(previewPed) then
        placementActive = false
        unfreezePlayer()
        SendNUIMessage({ action = 'setPlacementActive', data = false })
        toggleNuiFrame(true)
        return
    end
    CreateThread(function()
        local wasSnapping = false
        while placementActive and previewPed and DoesEntityExist(previewPed) do
            DisableControlAction(0, 24, true)
            DisableControlAction(0, 25, true)
            DisableControlAction(0, 32, true)
            DisableControlAction(0, 33, true)
            DisableControlAction(0, 34, true)
            DisableControlAction(0, 35, true)
            DisableControlAction(0, 44, true)
            DisableControlAction(0, 38, true)
            DisableControlAction(0, 191, true)
            DisableControlAction(0, 201, true)
            DisableControlAction(0, 22, true)
            DisableControlAction(0, 322, true)
            DisableControlAction(0, 202, true)
            local rayPos = getRaycastPosition()
            local forward, right = getCameraVectors()
            local speed = BASE_SPEED * getSpeedMultiplier()
            if IsDisabledControlPressed(0, 32) then manualOffset = manualOffset + (forward * speed) end
            if IsDisabledControlPressed(0, 33) then manualOffset = manualOffset - (forward * speed) end
            if IsDisabledControlPressed(0, 34) then manualOffset = manualOffset - (right * speed) end
            if IsDisabledControlPressed(0, 35) then manualOffset = manualOffset + (right * speed) end
            local rotateSpeed = ROTATE_SPEED * getSpeedMultiplier()
            if IsControlPressed(0, 174) then pedHeading = pedHeading - rotateSpeed end
            if IsControlPressed(0, 175) then pedHeading = pedHeading + rotateSpeed end
            local snapToGround = IsControlPressed(0, 47)
            if snapToGround or wasSnapping then
                heightOffset = 0.0
            end
            wasSnapping = snapToGround
            local hSpeed = HEIGHT_SPEED * getSpeedMultiplier()
            if not snapToGround then
                if IsDisabledControlPressed(0, 44) then heightOffset = heightOffset + hSpeed end
                if IsDisabledControlPressed(0, 38) then heightOffset = heightOffset - hSpeed end
                if IsControlPressed(0, 172) then heightOffset = heightOffset + hSpeed end
                if IsControlPressed(0, 173) then heightOffset = heightOffset - hSpeed end
            end
            if IsControlJustPressed(0, 244) then
                ignoreMouseMovement = not ignoreMouseMovement
                if ignoreMouseMovement then
                    lockedBasePos = GetEntityCoords(previewPed)
                    manualOffset = vector3(0.0, 0.0, 0.0)
                else
                    lockedBasePos = nil
                end
            end
            local basePos
            if ignoreMouseMovement and lockedBasePos then
                basePos = lockedBasePos + manualOffset
            else
                basePos = rayPos + manualOffset
            end
            if snapToGround then
                local groundZ = getGroundZAt(basePos.x, basePos.y, basePos.z)
                basePos = vector3(basePos.x, basePos.y, groundZ)
                if ignoreMouseMovement then
                    lockedBasePos = basePos
                    manualOffset = vector3(0.0, 0.0, 0.0)
                end
            end
            SetEntityCoords(previewPed, basePos.x, basePos.y, basePos.z + heightOffset, false, false, false, false)
            SetEntityHeading(previewPed, pedHeading)
            if IsControlJustPressed(0, 182) then
                playerFrozen = not playerFrozen
            end
            FreezeEntityPosition(cache.ped, playerFrozen)
            if IsDisabledControlJustPressed(0, 191) or IsDisabledControlJustPressed(0, 201) or IsDisabledControlJustPressed(0, 22) then
                readFinalCoordsAndEnd()
                break
            end
            if IsDisabledControlJustPressed(0, 322) or IsDisabledControlJustPressed(0, 202) then
                cancelPlacement()
                break
            end
            Wait(0)
        end
    end)
end
