local inventory = {}
local QBCore = exports['qb-core']:GetCoreObject()

function inventory.AddItem(playerId, itemName, amount, metadata)
    local Player = QBCore.Functions.GetPlayer(playerId)
    if not Player then return false end
    return Player.Functions.AddItem(itemName, amount or 1, false, metadata or {})
end

function inventory.RemoveItem(playerId, itemName, count, _metadata, slot)
    local Player = QBCore.Functions.GetPlayer(playerId)
    if not Player then return false end
    return Player.Functions.RemoveItem(itemName, count or 1, slot)
end

function inventory.RemoveItemsWithMetadata(playerId, metaFilter)
    local Player = QBCore.Functions.GetPlayer(playerId)
    if not Player or not Player.PlayerData or not Player.PlayerData.items then return end
    local toRemove = {}
    for slot, item in pairs(Player.PlayerData.items) do
        if not item then continue end
        local meta = item.info or item.metadata
        if meta and type(meta) == 'table' then
            local match = true
            for k, v in pairs(metaFilter) do
                if meta[k] ~= v then match = false break end
            end
            if match then
                toRemove[#toRemove + 1] = { slot = slot, name = item.name, amount = item.amount or 1 }
            end
        end
    end
    for i = 1, #toRemove do
        local r = toRemove[i]
        Player.Functions.RemoveItem(r.name, r.amount, r.slot)
    end
end

return inventory
