local REDZONE_META = 'redzone'

local function hasRedzoneMeta(slotData)
    if not slotData or type(slotData) ~= 'table' then return false end
    local meta = slotData.metadata
    return meta[REDZONE_META] == true
end

local function isSamePlayerInventory(fromInv, toInv, fromType, toType)
    if fromType ~= 'player' or toType ~= 'player' then return false end
    if type(fromInv) == 'number' and type(toInv) == 'number' then return fromInv == toInv end
    if type(fromInv) == 'table' and type(toInv) == 'table' then
        return fromInv.id == toInv.id and (not fromInv.owner or fromInv.owner == toInv.owner)
    end
    return tostring(fromInv) == tostring(toInv)
end

AddEventHandler('redzone:server:playerLoaded', function(playerId)
    if not playerId then return end
    Loadout.removeLoadout(playerId)
end)

CreateThread(function()
    exports.ox_inventory:registerHook('swapItems', function(payload)
        local fromSlot = payload.fromSlot
        if not hasRedzoneMeta(fromSlot) then return true end
        if isSamePlayerInventory(payload.fromInventory, payload.toInventory, payload.fromType, payload.toType) then
            return true
        end
        return false
    end, {
        typeFilter = { player = true },
    })
end)

CreateThread(function()
    local players = GetPlayers()
    for i = 1, #players do
        local playerId = tonumber(players[i]) or players[i]
        if playerId and playerId > 0 then
            Loadout.removeLoadout(playerId)
        end
    end
end)
