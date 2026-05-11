local inventory = {}

function inventory.AddItem(_playerId, _itemName, _amount, _metadata)
    return false
end

function inventory.RemoveItem(_playerId, _itemName, _count, _metadata, _slot)
    return false
end

function inventory.RemoveItemsWithMetadata(_playerId, _metaFilter)
end

function inventory.ConfiscateInventory(_playerId)
    return false
end

function inventory.ReturnInventory(_playerId)
    return false
end

function inventory.ClearInventory(_playerId, _keep)
    return false
end

return inventory
