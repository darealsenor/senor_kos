local inventory = {}

local cachedItems = nil

function inventory.GetInventoryItems()
    if cachedItems then
        return cachedItems
    end
    
    cachedItems = {}
    return cachedItems
end

function inventory.Items(itemName)
    if not itemName then
        return inventory.GetInventoryItems()
    end
    
    return nil
end

function inventory.AddItem(playerId, itemName, amount, metadata)
    return false
end

function inventory.Disarm(playerId, state)
    if state then
        TriggerClientEvent('weapon:client:disarm', playerId)
    end
end

return inventory

