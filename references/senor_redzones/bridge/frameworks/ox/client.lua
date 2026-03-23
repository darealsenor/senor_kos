local framework = {}

---Revive the local player at the given position.
---@param x number
---@param y number
---@param z number
---@param heading? number
function framework.Revive(x, y, z, heading)
    NetworkResurrectLocalPlayer(x, y, z, heading or 0, true, false)
end

AddEventHandler('_playerLoaded', function()
    TriggerEvent('redzone:client:playerLoaded')
end)

return framework
