local cfg = Config.cleanup
if not cfg or not cfg.enabled then return end

local INTERVAL = (type(cfg.intervalMs) == 'number' and cfg.intervalMs > 0) and cfg.intervalMs or 3000

---@param coords vector3
---@param radius number
local function cleanupZone(coords, radius)
    if cfg.peds then
        local peds = GetGamePool('CPed')
        for i = 1, #peds do
            local ped = peds[i]
            if not IsPedAPlayer(ped) and not IsEntityAMissionEntity(ped) then
                if #(coords - GetEntityCoords(ped)) <= radius then
                    DeleteEntity(ped)
                end
            end
        end
    end

    if cfg.vehicles then
        local vehicles = GetGamePool('CVehicle')
        for i = 1, #vehicles do
            local vehicle = vehicles[i]
            if not IsPedAPlayer(GetPedInVehicleSeat(vehicle, -1)) and not IsEntityAMissionEntity(vehicle) then
                if #(coords - GetEntityCoords(vehicle)) <= radius then
                    DeleteEntity(vehicle)
                end
            end
        end
    end

    if cfg.objects then
        local objects = GetGamePool('CObject')
        for i = 1, #objects do
            local obj = objects[i]
            if not IsEntityAMissionEntity(obj) then
                if #(coords - GetEntityCoords(obj)) <= radius then
                    DeleteEntity(obj)
                end
            end
        end
    end
end

local running = false

AddEventHandler('redzone:client:zoneEntered', function()
    if running then return end
    local entry = State.getEntry(State.currentZoneId)
    if not entry then return end
    running = true
    CreateThread(function()
        while State.inZone do
            cleanupZone(entry.coords, entry.radius)
            Wait(INTERVAL)
        end
        running = false
    end)
end)
