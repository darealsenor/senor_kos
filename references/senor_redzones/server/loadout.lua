local REDZONE_META = 'redzone'

Loadout = {}

function Loadout.giveLoadout(playerId, loadout)
    if not loadout or not next(loadout) then return end
    local meta = { [REDZONE_META] = true }
    if #loadout > 0 then
        for i = 1, #loadout do
            local item = loadout[i]
            local name = type(item) == 'table' and item.name or item
            if name then
                local amount = type(item) == 'table' and (item.amount or 1) or 1
                local m = type(item) == 'table' and item.metadata or nil
                local merged = { [REDZONE_META] = true }
                if m and type(m) == 'table' then for k, v in pairs(m) do merged[k] = v end end
                Bridge.inventory.AddItem(playerId, name, amount, merged)
            end
        end
    else
        for name, amount in pairs(loadout) do
            if type(name) == 'string' and type(amount) == 'number' and amount > 0 then
                Bridge.inventory.AddItem(playerId, name, amount, meta)
            end
        end
    end
end

function Loadout.removeLoadout(playerId)
    Bridge.inventory.RemoveItemsWithMetadata(playerId, { [REDZONE_META] = true })
end
