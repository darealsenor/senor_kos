local hospital = {}

---@param playerId number
function hospital.Revive(playerId)
    TriggerClientEvent('hospital:client:Revive', playerId)
end

return hospital
