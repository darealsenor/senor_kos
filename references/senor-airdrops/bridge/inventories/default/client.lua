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

function inventory.Disarm(state)
    if state then
        RemoveAllPedWeapons(cache.ped, true)
    end
end

return inventory

