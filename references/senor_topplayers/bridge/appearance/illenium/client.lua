local appearance = {}

function appearance.SetPedAppearance(ped, data)
    if not ped or not data then return end
    exports['illenium-appearance']:setPedAppearance(ped, data)
end

return appearance
