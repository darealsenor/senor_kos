local framework = {}

---Revive the local player at the given position (esx_ambulancejob:revive then teleport).
---@param x number
---@param y number
---@param z number
---@param heading? number
function framework.Revive(x, y, z, heading)
    lib.print.debug('esx framework.Revive called', { x = x, y = y, z = z, heading = heading })
    TriggerEvent('esx_ambulancejob:revive')
    TriggerEvent('ars_ambulancejob:healPlayer', { revive = true })
    Wait(100)
    local ped = cache.ped or PlayerPedId()
    if ped and DoesEntityExist(ped) then
        SetEntityCoordsNoOffset(ped, x, y, z, false, false, false)
        SetEntityHeading(ped, heading or 0)
    end
end

RegisterNetEvent('esx:playerLoaded', function()
    TriggerEvent('redzone:client:playerLoaded')
end)

return framework
