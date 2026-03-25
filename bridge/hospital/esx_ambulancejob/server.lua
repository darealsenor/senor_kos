local hospital = {}

---@param playerId number
function hospital.Revive(playerId)
    TriggerClientEvent('esx_ambulancejob:revive', playerId)
end

return hospital
