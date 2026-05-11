local inventory = {}

function inventory.AddItem(playerId, itemName, amount, metadata)
    local Player = exports['qb-core']:GetCoreObject().Functions.GetPlayer(playerId)
    if not Player then
        return false
    end
    return Player.Functions.AddItem(itemName, amount or 1, false, metadata or {})
end

function inventory.RemoveItem(playerId, itemName, count, _metadata, slot)
    local Player = exports['qb-core']:GetCoreObject().Functions.GetPlayer(playerId)
    if not Player then
        return false
    end
    return Player.Functions.RemoveItem(itemName, count or 1, slot)
end

function inventory.RemoveItemsWithMetadata(playerId, metaFilter)
    local Player = exports['qb-core']:GetCoreObject().Functions.GetPlayer(playerId)
    if not Player or not Player.PlayerData or not Player.PlayerData.items then
        return
    end

    for _, item in pairs(Player.PlayerData.items) do
        if item and item.info and type(item.info) == 'table' then
            local match = true
            for k, v in pairs(metaFilter) do
                if item.info[k] ~= v then
                    match = false
                    break
                end
            end
            if match then
                Player.Functions.RemoveItem(item.name, item.amount or 1, item.slot)
            end
        end
    end
end

function inventory.ConfiscateInventory(_playerId)
    return false
end

function inventory.ReturnInventory(_playerId)
    return false
end

function inventory.ClearInventory(playerId, _keep)
    local Player = exports['qb-core']:GetCoreObject().Functions.GetPlayer(playerId)
    if not Player or not Player.PlayerData or not Player.PlayerData.items then
        return false
    end

    for _, item in pairs(Player.PlayerData.items) do
        if item and item.name and (item.amount or 0) > 0 then
            Player.Functions.RemoveItem(item.name, item.amount, item.slot)
        end
    end

    return true
end

return inventory
