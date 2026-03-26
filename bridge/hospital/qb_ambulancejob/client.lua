local hospital = {}

---@return nil
function hospital.Revive()
    TriggerEvent('hospital:client:Revive')
end

return hospital

