local hospital = {}

---@param playerId number
function hospital.Revive(playerId)
    TriggerClientEvent('p_ambulancejob/client/death/revive', playerId)
end

return hospital
