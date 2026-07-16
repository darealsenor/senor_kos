
-- https://ayznnn.gitbook.io/waveshield-v4/documentation/for-developers/exports

local antiCheat = {}

---@type table<number, number>
local refs = {}

local function getResource()
    return ServerConfig and ServerConfig.AntiCheat and ServerConfig.AntiCheat.folder or ''
end

local function toggleBypass(playerId, allow)
    local resource = getResource()
    if resource == '' then
        return
    end
    exports[resource]:toggleBypass(playerId, allow)
end

---@param playerId number
local function enable(playerId)
    local current = refs[playerId] or 0
    refs[playerId] = current + 1
    if current == 0 then
        toggleBypass(playerId, true)
    end
end

---@param playerId number
local function disable(playerId)
    local current = refs[playerId] or 0
    if current <= 0 then
        return
    end
    if current == 1 then
        refs[playerId] = nil
        toggleBypass(playerId, false)
    else
        refs[playerId] = current - 1
    end
end

---@param playerId number
---@param _kind string 'revive' | 'spectate'
---@param enabled boolean
function antiCheat.SetBypass(playerId, _kind, enabled)
    if not playerId or playerId <= 0 then
        return
    end
    if enabled then
        enable(playerId)
    else
        disable(playerId)
    end
end

AddEventHandler('playerDropped', function()
    refs[source] = nil
end)

-- If senor_kos restarts mid-match, drop every still-held bypass so WaveShield
-- doesn't leave players permanently exempt until their next reconnect.
AddEventHandler('onResourceStop', function(resourceName)
    if resourceName ~= cache.resource then
        return
    end
    for playerId in pairs(refs) do
        toggleBypass(playerId, false)
    end
    refs = {}
end)

return antiCheat
