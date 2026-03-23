local inventory = {}
local QBCore = exports["qb-core"]:GetCoreObject()

local cachedItems = nil

function inventory.GetInventoryItems()
    if cachedItems then
        return cachedItems
    end
    
    local items = {}
    
    local sharedItems = QBCore.Shared.Items
    if sharedItems then
        for itemName, itemData in pairs(sharedItems) do
            items[#items + 1] = {
                name = itemName,
                label = itemData.label or itemName,
                weight = itemData.weight or 0,
                type = itemData.type or 'item',
                image = itemData.image or itemData.name or itemName,
                unique = itemData.unique or false,
                useable = itemData.useable or false,
                description = itemData.description or '',
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
        return sharedItems[itemName]
    end
    
    return nil
end

function inventory.AddItem(playerId, itemName, amount, metadata)
    local Player = QBCore.Functions.GetPlayer(playerId)
    if not Player then return false end
    
    return Player.Functions.AddItem(itemName, amount, false, metadata or {})
end

function inventory.Disarm(playerId, state)
    if state then
        TriggerClientEvent('qb-weapons:client:SetWeaponQuality', playerId, 0)
    end
end

return inventory

