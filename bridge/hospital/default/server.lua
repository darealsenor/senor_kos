local hospital = {}

---@param _playerId number
function hospital.Revive(_playerId)
    lib.print.error('KOS hospital bridge: default revive cannot run (no hospital resource found). Install/configure a hospital resource (qbx_medical / qb-ambulancejob / esx_ambulancejob / wasabi_ambulance).')
end

return hospital
