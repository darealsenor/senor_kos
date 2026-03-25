local hospital = {}

---@param playerId number
function hospital.Revive(playerId)
    exports.qbx_medical:Revive(playerId)
end

return hospital
