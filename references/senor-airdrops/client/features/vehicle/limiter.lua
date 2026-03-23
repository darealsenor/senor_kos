local vehicleLimiter = {}

local vehicleThreadActive = false

local currentThread = nil

local function isInVehicle()
    return cache.vehicle and true or false
end

local function attack()
    Bridge.notify.Notify({
        id = 'airdrops',
        title = locale('notification_warning_title'),
        description = locale('notification_warning_leave_vehicle'),
        type = 'warning',
        position = 'center-left'
    })
    SetEntityHealth(cache.ped, GetEntityHealth(cache.ped) - Config.VehicleLimiter.DamageAmount)
end

function vehicleLimiter.vehicleLimiterThread(enabled, data)
    if not Config.VehicleLimiter.Enabled then return end

    if currentThread then
        vehicleThreadActive = false
        currentThread = nil
    end

    vehicleThreadActive = enabled
    if enabled then
        currentThread = CreateThread(function()
            while vehicleThreadActive and data.client.active do
                Wait(Config.VehicleLimiter.CheckInterval)
                if isInVehicle() then
                    if data.timeLeft <= Config.VehicleLimiter.WarningTime then
                        attack()
                    end

                    if data.timeLeft <= Config.VehicleLimiter.CriticalTime then
                        attack()
                        if Config.VehicleLimiter.DisableEngineOnCritical then
                            SetVehicleEngineOn(cache.vehicle, false, true, true)
                        end
                    end
                end
            end
            currentThread = nil
        end)
    end
end

return vehicleLimiter
