-- npc

-- credits to sleepless_pedmanager
local ped = nil
local point = nil

---@param coords vector3|vector4
---@param text string
local function drawText3D(coords, text)
    local onScreen, screenX, screenY = GetScreenCoordFromWorldCoord(coords.x, coords.y, coords.z)
    if not onScreen then
        return
    end

    SetTextScale(0.35, 0.35)
    SetTextFont(4)
    SetTextProportional(true)
    SetTextCentre(true)
    SetTextColour(255, 255, 255, 215)
    SetTextOutline()
    BeginTextCommandDisplayText('STRING')
    AddTextComponentSubstringPlayerName(text)
    EndTextCommandDisplayText(screenX, screenY)
end

local function spawnPed(model, coords)
    if ped and DoesEntityExist(ped) then
        return ped
    end

    lib.requestModel(model, 5000)
    ped = CreatePed(5, model, coords.x, coords.y, coords.z - 1.0, coords.w, false, false)
    SetModelAsNoLongerNeeded(model)
    if not DoesEntityExist(ped) then
        ped = nil
        return
    end
    SetPedDefaultComponentVariation(ped)
    FreezeEntityPosition(ped, true)
    SetEntityInvincible(ped, true)
    SetBlockingOfNonTemporaryEvents(ped, true)
    SetPedFleeAttributes(ped, 0, false)

    if Interaction.npc.interaction.target.enabled then
        Bridge.target.addLocalEntity(ped, {
            distance = Interaction.npc.interaction.target.distance,
            label = Interaction.npc.interaction.target.label,
            name = Interaction.npc.interaction.target.name,
            onSelect = Interaction.npc.interaction.target.onSelect,
        })
    end

    return ped
end

local function dismissPed()
    if not ped then
        return
    end

    if Interaction.npc.interaction.target.enabled then
        Bridge.target.removeLocalEntity(ped)
    end

    if DoesEntityExist(ped) then
        DeleteEntity(ped)
    end
    ped = nil
end


local function createNPCInteraction()
    local keyCfg = Interaction.npc.interaction.keystroke

    point = lib.points.new({
        coords = vec3(Interaction.npc.coords.x, Interaction.npc.coords.y, Interaction.npc.coords.z),
        distance = Interaction.npc.distance,
        onEnter = function()
            spawnPed(Interaction.npc.model, Interaction.npc.coords)
        end,
        onExit = function()
            dismissPed()
        end,
        nearby = keyCfg.enabled and function(self)
            if self.currentDistance > Interaction.npc.interaction.target.distance then
                return
            end

            DrawMarker(2, self.coords.x, self.coords.y, self.coords.z + 0.15, 0.0, 0.0, 0.0, 0.0, 180.0, 0.0, 0.18, 0.18, 0.18, 255, 255, 255, 90, false, true, 2, false, nil, nil, false)
            drawText3D(vec3(self.coords.x, self.coords.y, self.coords.z + 1.05), locale(keyCfg.key.label))

            if IsControlJustReleased(0, keyCfg.key.code) then
                keyCfg.onPressed()
            end
        end or nil
    })
end

local function removeNPCInteraction()
    dismissPed()
    if point then
        point:remove()
        point = nil
    end
end

if Interaction.npc.enabled then
    CreateThread(createNPCInteraction)
end

AddEventHandler('onResourceStop', function(resourceName)
    if resourceName == cache.resource then
        removeNPCInteraction()
    end
end)

-- keybind
if Interaction.keybind.enabled then
    lib.addKeybind({
        name = Interaction.keybind.name,
        description = Interaction.keybind.description,
        defaultKey = Interaction.keybind.defaultKey,
        onPressed = Interaction.keybind.onPressed,
    })
end
