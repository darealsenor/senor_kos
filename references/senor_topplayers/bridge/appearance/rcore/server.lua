local appearance = {}

---Returns skin table from rcore_clothing by identifier (see rcore docs).
---@param identifier string
---@return table|nil
function appearance.GetPlayerAppearance(identifier)
    if not identifier or type(identifier) ~= 'string' or identifier == '' then return nil end
    return exports['rcore_clothing']:getSkinByIdentifier(identifier)
end

return appearance
