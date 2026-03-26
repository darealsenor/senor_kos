local hospital = {}

---@return nil
function hospital.Revive()
    TriggerEvent('qbx_medical:client:playerRevived')
end

return hospital

