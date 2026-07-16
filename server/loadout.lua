local KOS_LOADOUT_META = 'kosLoadout'
local confiscatedPlayers = {}

-- Loadouts use ox_inventory features (Confiscate/Return/Clear inventory plus the
-- swapItems hook) that the qb-inventory and default bridges cannot reproduce.
-- If ox_inventory is not running we no-op the whole module so the rest of the
-- script keeps working — matches just start without preset loadouts.
local enabled = GetResourceState('ox_inventory'):find('start') ~= nil

Loadout = Loadout or {}

if not enabled then
    lib.print.info('[loadout] ox_inventory not detected; loadouts are disabled')
end

local function mergeMetadata(loadoutId, itemMetadata)
    local metadata = {
        [KOS_LOADOUT_META] = true,
        kosLoadoutId = loadoutId,
    }

    if type(itemMetadata) ~= 'table' then
        return metadata
    end

    for key, value in pairs(itemMetadata) do
        metadata[key] = value
    end

    return metadata
end

local function hasLoadoutMeta(slotData)
    if type(slotData) ~= 'table' then
        return false
    end

    local metadata = slotData.metadata
    return type(metadata) == 'table' and metadata[KOS_LOADOUT_META] == true
end

local function isSamePlayerInventory(fromInv, toInv, fromType, toType)
    if fromType ~= 'player' or toType ~= 'player' then
        return false
    end

    if type(fromInv) == 'number' and type(toInv) == 'number' then
        return fromInv == toInv
    end

    if type(fromInv) == 'table' and type(toInv) == 'table' then
        return fromInv.id == toInv.id and (not fromInv.owner or fromInv.owner == toInv.owner)
    end

    return tostring(fromInv) == tostring(toInv)
end

local function getPreset(loadoutId)
    if not loadoutId or loadoutId == '' then
        return nil
    end

    local presets = Shared.Loadouts
    if type(presets) ~= 'table' then
        return nil
    end

    local preset = presets[loadoutId]
    if type(preset) ~= 'table' or type(preset.items) ~= 'table' or not next(preset.items) then
        return nil
    end

    return preset
end

function Loadout.hasPreset(loadoutId)
    if not enabled then return false end
    return getPreset(loadoutId) ~= nil
end

function Loadout.giveLoadout(playerId, loadoutId)
    if not enabled then return false end
    local preset = getPreset(loadoutId)
    if not preset then
        return false
    end

    local allGranted = true
    for i = 1, #preset.items do
        local item = preset.items[i]
        if type(item) == 'table' and item.name then
            local ok = Bridge.inventory.AddItem(playerId, item.name, item.amount or 1, mergeMetadata(loadoutId, item.metadata))
            if ok == false then
                allGranted = false
                lib.print.debug(('loadout: failed to give %s x%s to %s for %s'):format(
                    tostring(item.name),
                    tostring(item.amount or 1),
                    tostring(playerId),
                    tostring(loadoutId)
                ))
            end
        end
    end

    return allGranted
end

function Loadout.removeLoadout(playerId)
    if not enabled then return end
    Bridge.inventory.RemoveItemsWithMetadata(playerId, {
        [KOS_LOADOUT_META] = true,
    })
end

function Loadout.confiscateForMatch(playerId, loadoutId)
    if not enabled then return end
    if not getPreset(loadoutId) or confiscatedPlayers[playerId] ~= nil then
        return
    end

    Bridge.inventory.ConfiscateInventory(playerId)
    confiscatedPlayers[playerId] = 'pending'
end

function Loadout.prepareRound(playerId, loadoutId, callback)
    if not enabled or not getPreset(loadoutId) then
        if type(callback) == 'function' then
            callback(true)
        end
        return
    end

    local status = confiscatedPlayers[playerId]
    local needsDelay = status == 'pending'
    if status == nil then
        Bridge.inventory.ConfiscateInventory(playerId)
        confiscatedPlayers[playerId] = 'pending'
        needsDelay = true
    end

    CreateThread(function()
        if needsDelay then
            Wait(1000)
        end
        local cleared = Bridge.inventory.ClearInventory(playerId)
        if cleared == false then
            lib.print.debug(('loadout: failed to clear inventory for %s'):format(tostring(playerId)))
        end
        Loadout.removeLoadout(playerId)
        local granted = Loadout.giveLoadout(playerId, loadoutId)
        confiscatedPlayers[playerId] = true
        if type(callback) == 'function' then
            callback(granted ~= false)
        end
    end)
end

function Loadout.restoreInventory(playerId)
    if not enabled then return end
    if confiscatedPlayers[playerId] == nil then
        Loadout.removeLoadout(playerId)
        return
    end

    CreateThread(function()
        Bridge.inventory.ClearInventory(playerId)
        Loadout.removeLoadout(playerId)
        Wait(1000)
        Bridge.inventory.ReturnInventory(playerId)
    end)

    confiscatedPlayers[playerId] = nil
end

function Loadout.handlePlayerLoaded(playerId)
    if not enabled then return end
    local id = tonumber(playerId) or 0
    if id <= 0 then
        return
    end

    confiscatedPlayers[id] = nil
    Loadout.removeLoadout(id)
end

AddEventHandler(Events.SERVER_PLAYER_LOADED, function(playerId)
    Loadout.handlePlayerLoaded(playerId or source)
end)

CreateThread(function()
    local players = Bridge.framework.GetPlayers()
    for i = 1, #players do
        local playerId = tonumber(players[i]) or 0
        if playerId > 0 then
            Loadout.handlePlayerLoaded(playerId)
        end
    end
end)

CreateThread(function()
    if not enabled then
        return
    end

    exports.ox_inventory:registerHook('swapItems', function(payload)
        local fromSlot = payload and payload.fromSlot
        if not hasLoadoutMeta(fromSlot) then
            return true
        end

        if isSamePlayerInventory(payload.fromInventory, payload.toInventory, payload.fromType, payload.toType) then
            return true
        end

        return false
    end, {
        typeFilter = {
            player = true,
        },
    })
end)
