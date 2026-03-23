local inventory = {}
local QBCore = exports['qb-core']:GetCoreObject()
local cachedItems = nil

function inventory.GetInventoryItems()
    if cachedItems then
        return cachedItems
    end
    local items = {}
    local sharedItems = QBCore.Shared.Items
    if sharedItems then
        for itemName, itemData in pairs(sharedItems) do
            items[itemName] = {
                name = itemName,
                label = itemData.label or itemName,
            }
        end
    end
    cachedItems = items
    return items
end

function inventory.Items(itemName)
    if not itemName then
        return inventory.GetInventoryItems()
    end
    local sharedItems = QBCore.Shared.Items
    if sharedItems and sharedItems[itemName] then
        return {
            name = itemName,
            label = sharedItems[itemName].label or itemName,
        }
    end
    return nil
end

return inventory
