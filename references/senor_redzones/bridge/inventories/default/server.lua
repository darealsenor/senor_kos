local inventory = {}

function inventory.AddItem(_playerId, _itemName, _amount, _metadata)
    return false
end

function inventory.RemoveItem(_playerId, _itemName, _count, _metadata, _slot)
    return false
end

function inventory.RemoveItemsWithMetadata(_playerId, _metaFilter)
end

return inventory
