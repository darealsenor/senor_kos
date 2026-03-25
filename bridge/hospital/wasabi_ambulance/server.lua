local hospital = {}

---@param playerId number
function hospital.Revive(playerId)
    exports.wasabi_ambulance:RevivePlayer(playerId)
end

return hospital
