local inventory = {}
local qbCore

local function getQBCore()
    if qbCore then
        return qbCore
    end

    if GetResourceState('qb-core') ~= 'started' then
        return nil
    end

    qbCore = exports['qb-core']:GetCoreObject()
    return qbCore
end

---@return boolean
function inventory.AutoPullWeapon()
    local QBCore = getQBCore()
    if not QBCore or not QBCore.Functions then
        return false
    end

    local playerData = QBCore.Functions.GetPlayerData()
    local items = playerData and playerData.items
    if type(items) ~= 'table' then
        return false
    end

    for _, item in pairs(items) do
        local name = type(item) == 'table' and tostring(item.name or '') or ''
        if name ~= '' and name:upper():find('^WEAPON_') then
            TriggerEvent('QBCore:Client:UseItem', {
                name = name,
                amount = tonumber(item.amount) or 1,
                slot = tonumber(item.slot) or nil,
                info = item.info or item.metadata or {},
            })
            return true
        end
    end

    return false
end

return inventory
