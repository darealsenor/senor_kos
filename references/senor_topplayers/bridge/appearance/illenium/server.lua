local appearance = {}

---Returns appearance table from illenium-appearance playerskins table. Identifier must be citizenid (QB/Qbox) or character id (ox) or identifier (ESX).
---@param identifier string
---@return table|nil
function appearance.GetPlayerAppearance(identifier)
    if not identifier or type(identifier) ~= 'string' or identifier == '' then return nil end
    local skin = MySQL.scalar.await('SELECT skin FROM playerskins WHERE citizenid = ? AND active = 1 LIMIT 1', { identifier })
    if not skin then return nil end
    return json.decode(skin)
end

return appearance
