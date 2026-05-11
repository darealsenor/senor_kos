local hospital = {}

---@param playerId number
function hospital.Revive(playerId)
    exports.wasabi_ambulance_v2:RevivePlayer(playerId)
end

return hospital
