local hospital = {}

---@return nil
function hospital.Revive()
    local ped = cache.ped
    local coords = GetEntityCoords(ped)
    local heading = GetEntityHeading(ped)
    NetworkResurrectLocalPlayer(coords.x, coords.y, coords.z, heading, 0, true)
    if DoesEntityExist(ped) then
        SetEntityHealth(ped, 200)
        ClearPedBloodDamage(ped)
        ClearPedTasksImmediately(ped)
    end
end

return hospital
