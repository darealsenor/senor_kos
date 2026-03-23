local DEFAULT_PED_MODEL = `mp_m_freemode_01`
local POINT_DISTANCE = 40
local TEXT_DISTANCE = 3.0
local TEXT_Z_OFFSET = 1.0
local DEFAULT_TEXT_TEMPLATE = '~w~[~y~#%s~w~] ~w~ - ~g~%s ~w~ - ~r~%s ~w~ - ~p~%s'

local activePropPoints = {}
local activePedPoints = {}

local function capitalizeFirst(s)
    if not s or s == '' then return s end
    return s:sub(1, 1):upper() .. s:sub(2)
end

---@param pedData table
---@return string
local function getPedLabel(pedData)
    if pedData.text and pedData.text ~= '' then
        return pedData.text
    end
    local rank = pedData.categoryRanking and tostring(pedData.categoryRanking) or ''
    local name = (pedData.player and pedData.player.name) and tostring(pedData.player.name) or ''
    local category = capitalizeFirst((pedData.category and tostring(pedData.category)) or '')
    local value = (pedData.player and pedData.player.value ~= nil) and tostring(pedData.player.value) or ''
    return DEFAULT_TEXT_TEMPLATE:format(rank, name, category, value)
end

---@param coords vector3
---@param text string Supports GTA color codes: ~r~ ~g~ ~b~ ~w~ ~y~ ~o~ ~p~ ~c~ ~m~ ~n~ ~s~
local function drawText3D(coords, text)
    local onScreen, screenX, screenY = World3dToScreen2d(coords.x, coords.y, coords.z + TEXT_Z_OFFSET)
    if not onScreen then return end
    SetTextScale(0.35, 0.35)
    SetTextFont(4)
    SetTextProportional(true)
    SetTextColour(255, 255, 255, 215)
    SetTextOutline()
    SetTextEntry('STRING')
    SetTextCentre(true)
    AddTextComponentString(text)
    DrawText(screenX, screenY)
end

---@param row table
---@return vector4
local function vec4From(row)
    local c = row.coords
    if type(c) == 'vector4' then return c end
    return vector4(c.x or c[1] or 0, c.y or c[2] or 0, c.z or c[3] or 0, c.w or c[4] or 0)
end

---@param propData table
local function spawnProp(propData)
    if propData.propEntity and DoesEntityExist(propData.propEntity) then return end
    if not propData.prop or type(propData.prop) ~= 'string' or propData.prop == '' then return end
    local coords = vec4From(propData)
    local propHash = joaat(propData.prop)
    lib.requestModel(propHash, 5000)
    local prop = CreateObject(propHash, coords.x, coords.y, coords.z, false, false, false)
    SetModelAsNoLongerNeeded(propHash)
    if DoesEntityExist(prop) then
        PlaceObjectOnGroundProperly(prop)
        SetEntityHeading(prop, coords.w or 0)
        propData.propEntity = prop
    end
end

---@param propData table
local function dismissProp(propData)
    if propData.propEntity and DoesEntityExist(propData.propEntity) then
        DeleteEntity(propData.propEntity)
        propData.propEntity = nil
    end
end

---@param pedData table
local function spawnPed(pedData)
    if pedData.ped and DoesEntityExist(pedData.ped) then return end
    local coords = vec4From(pedData)
    local model = DEFAULT_PED_MODEL
    if pedData.player then
        local m = pedData.player.appearance.model
        m = type(m) == 'number' and m or joaat(m)
        if m and m ~= 0 then model = m end
    end
    lib.requestModel(model, 5000)
    local ped = CreatePed(5, model, coords.x, coords.y, coords.z - 1.0, coords.w, false, false)
    SetModelAsNoLongerNeeded(model)
    if not DoesEntityExist(ped) then return end
    SetPedDefaultComponentVariation(ped)
    FreezeEntityPosition(ped, true)
    SetEntityInvincible(ped, true)
    SetBlockingOfNonTemporaryEvents(ped, true)
    SetPedFleeAttributes(ped, 0, false)
    if pedData.player and pedData.player.appearance then
        Bridge.appearance.SetPedAppearance(ped, pedData.player.appearance)
    end
    if pedData.animation then
        ClearPedTasksImmediately(ped)
        lib.requestAnimDict(pedData.animation.dict, 5000)
        TaskPlayAnim(ped, pedData.animation.dict, pedData.animation.anim, 3.0, -8.0, -1, pedData.animation.flag or 1, 0, false, false, false)
        RemoveAnimDict(pedData.animation.dict)
    end
    pedData.ped = ped
end

---@param pedData table
local function dismissPed(pedData)
    if pedData.ped and DoesEntityExist(pedData.ped) then
        DeleteEntity(pedData.ped)
        pedData.ped = nil
    end
end

---@param payload table|nil { props = table[], peds = table[] }
local function refreshPodiums(payload)
    for i = 1, #activePropPoints do
        local point = activePropPoints[i]
        if point.propData then dismissProp(point.propData) end
        point:remove()
    end
    table.wipe(activePropPoints)
    for i = 1, #activePedPoints do
        local point = activePedPoints[i]
        if point.pedData then dismissPed(point.pedData) end
        point:remove()
    end
    table.wipe(activePedPoints)

    if not payload then return end
    local props = payload.props or {}
    local peds = payload.peds or {}

    for _, propData in ipairs(props) do
        local coords = vec4From(propData)
        local point = lib.points.new({
            coords = vector3(coords.x, coords.y, coords.z),
            distance = POINT_DISTANCE,
        })
        point.propData = propData
        function point:onEnter()
            spawnProp(self.propData)
        end
        function point:onExit()
            dismissProp(self.propData)
        end
        activePropPoints[#activePropPoints + 1] = point
    end

    for _, pedData in ipairs(peds) do
        local coords = vec4From(pedData)
        local point = lib.points.new({
            coords = vector3(coords.x, coords.y, coords.z),
            distance = POINT_DISTANCE,
        })
        point.pedData = pedData
        function point:onEnter()
            spawnPed(self.pedData)
        end
        function point:onExit()
            dismissPed(self.pedData)
        end
        function point:nearby()
            local data = self.pedData
            if not data.ped or not DoesEntityExist(data.ped) then return end
            if self.currentDistance <= TEXT_DISTANCE then
                drawText3D(GetEntityCoords(data.ped), getPedLabel(data))
            end
        end
        activePedPoints[#activePedPoints + 1] = point
    end
end

RegisterNetEvent('senor_topplayers:client:setPodiums', function(payload)
    State.podiums = {
        props = (payload and payload.props) or {},
        peds = (payload and payload.peds) or {},
    }
    refreshPodiums(State.podiums)
end)

AddEventHandler('onResourceStop', function(resourceName)
    if resourceName ~= GetCurrentResourceName() then return end
    for i = 1, #activePropPoints do
        if activePropPoints[i].propData then dismissProp(activePropPoints[i].propData) end
    end
    for i = 1, #activePedPoints do
        if activePedPoints[i].pedData then dismissPed(activePedPoints[i].pedData) end
    end
end)
