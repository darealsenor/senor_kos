local hospital = {}

---@param playerId number
function hospital.Revive(playerId)
    TriggerEvent('ak47_qb_ambulancejob:revive', playerId)
end

return hospital
