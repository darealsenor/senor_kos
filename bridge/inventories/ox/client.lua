local inventory = {}

---@return boolean
function inventory.AutoPullWeapon()
    if GetResourceState('ox_inventory') ~= 'started' then
        return false
    end

    local items = exports.ox_inventory:GetPlayerItems()
    if type(items) ~= 'table' then
        return false
    end

    for _, item in pairs(items) do
        local name = type(item) == 'table' and tostring(item.name or '') or ''
        local slot = type(item) == 'table' and tonumber(item.slot) or nil
        if slot and name ~= '' and name:upper():find('^WEAPON_') then
            exports.ox_inventory:useSlot(slot)
            return true
        end
    end

    return false
end

return inventory
