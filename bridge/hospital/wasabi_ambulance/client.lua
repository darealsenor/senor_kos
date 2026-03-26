local hospital = {}

---@return nil
function hospital.Revive()
    local ok = pcall(function()
        exports.wasabi_ambulance:RevivePlayer()
    end)
    if ok then
        return
    end
end

return hospital

