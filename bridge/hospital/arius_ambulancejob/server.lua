local hospital = {}

---@param playerId number
function hospital.Revive(playerId)
    TriggerClientEvent('ars_ambulancejob:healPlayer', playerId, {revive = true})
end

return hospital
