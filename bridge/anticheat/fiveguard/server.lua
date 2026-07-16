
-- https://docs.fiveguard.net/permission-system/ace-permissions
--
-- FiveGuard exposes SetTempPermission(src, category, permission, allow, ignoreStatic)
-- which we use to grant short-lived bypasses around revive / spectate actions.
--
-- The permission categories below match FiveGuard's documented ACE permissions.
-- If your build renames a category or permission, edit the `permissions` table
-- and the bridge will pick up the change on restart.

local antiCheat = {}

-- Permissions to toggle for each protected action.
--   revive   - we resurrect the player, set their health, and clear their tasks.
--              FiveGuard could flag any of these as god-mode / clear-tasks abuse.
--   spectate - we use spectator natives to follow teammates.
local permissions = {
    revive = {
        { category = 'Client', permission = 'BypassGodMode' },
        { category = 'Misc',   permission = 'BypassClearTasks' },
    },
    spectate = {
        { category = 'Client', permission = 'BypassSpectate' },
    },
}

---@type table<number, table<string, number>>
local refs = {}

local function getResource()
    return ServerConfig and ServerConfig.AntiCheat and ServerConfig.AntiCheat.folder or ''
end

local function setPermission(playerId, perm, allow)
    local resource = getResource()
    if resource == '' then
        return
    end
    exports[resource]:SetTempPermission(playerId, perm.category, perm.permission, allow, false)
end

local function applyAll(playerId, kind, allow)
    local perms = permissions[kind]
    if not perms then return end
    for i = 1, #perms do
        setPermission(playerId, perms[i], allow)
    end
end

local function changeRefs(playerId, kind, delta)
    if not permissions[kind] then return end
    local playerRefs = refs[playerId]
    if not playerRefs then
        playerRefs = {}
        refs[playerId] = playerRefs
    end
    local before = playerRefs[kind] or 0
    local after = before + delta
    if after < 0 then after = 0 end
    playerRefs[kind] = after
    if before == 0 and after > 0 then
        applyAll(playerId, kind, true)
    elseif before > 0 and after == 0 then
        applyAll(playerId, kind, false)
    end
end

---@param playerId number
---@param kind string 'revive' | 'spectate'
---@param enabled boolean
function antiCheat.SetBypass(playerId, kind, enabled)
    if not playerId or playerId <= 0 then
        return
    end
    if not permissions[kind] then
        return
    end
    changeRefs(playerId, kind, enabled and 1 or -1)
end

AddEventHandler('playerDropped', function()
    refs[source] = nil
end)

-- If senor_kos restarts mid-match, drop every still-held bypass so FiveGuard
-- doesn't leave players permanently exempt until their next reconnect.
AddEventHandler('onResourceStop', function(resourceName)
    if resourceName ~= cache.resource then
        return
    end
    for playerId, kinds in pairs(refs) do
        for kind, count in pairs(kinds) do
            if count > 0 then
                applyAll(playerId, kind, false)
            end
        end
    end
    refs = {}
end)

return antiCheat
