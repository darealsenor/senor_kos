local framework = {}

---Revive the local player at the given position (qb-ambulancejob hospital:client:Revive then teleport).
---@param x number
---@param y number
---@param z number
---@param heading? number
function framework.Revive(x, y, z, heading)
    TriggerEvent('hospital:client:Revive')
    local ped = cache.ped or PlayerPedId()
    if ped and DoesEntityExist(ped) then
        SetEntityCoords(ped, x, y, z, false, false, false, true)
        SetEntityHeading(ped, heading or 0)
    end
end

AddEventHandler('QBCore:Client:OnPlayerLoaded', function()
    TriggerEvent('redzone:client:playerLoaded')
end)

return framework
