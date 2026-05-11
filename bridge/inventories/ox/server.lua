local inventory = {}

function inventory.AddItem(playerId, itemName, amount, metadata)
    return exports.ox_inventory:AddItem(playerId, itemName, amount or 1, metadata or {})
end

function inventory.RemoveItem(playerId, itemName, count, metadata, slot)
    return exports.ox_inventory:RemoveItem(playerId, itemName, count or 1, metadata, slot)
end

function inventory.RemoveItemsWithMetadata(playerId, metaFilter)
    local items = exports.ox_inventory:GetInventoryItems(playerId)
    if not items then
        return
    end

    for _, slotData in pairs(items) do
        if slotData.metadata and type(slotData.metadata) == 'table' then
            local match = true
            for k, v in pairs(metaFilter) do
                if slotData.metadata[k] ~= v then
                    match = false
                    break
                end
            end
            if match then
                exports.ox_inventory:RemoveItem(playerId, slotData.name, slotData.count, slotData.metadata, slotData.slot)
            end
        end
    end
end

function inventory.ConfiscateInventory(playerId)
    return exports.ox_inventory:ConfiscateInventory(playerId)
end

function inventory.ReturnInventory(playerId)
    return exports.ox_inventory:ReturnInventory(playerId)
end

function inventory.ClearInventory(playerId, keep)
    return exports.ox_inventory:ClearInventory(playerId, keep)
end

return inventory
