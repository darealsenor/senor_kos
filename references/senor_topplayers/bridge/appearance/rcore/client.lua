local appearance = {}

function appearance.SetPedAppearance(ped, data)
    if not ped or not data then return end
    exports['rcore_clothing']:setPedSkin(ped, data)
end

return appearance
