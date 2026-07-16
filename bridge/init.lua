---@param bridgeType string Bridge type from config.lua
---@return string, string, string
local function getBridge(bridgeType)
    local context = lib.context
    local bridge = ConfigBridge[bridgeType]

    for i=1, #bridge do
        local info = bridge[i]
        if GetResourceState(info.resource):find("start") then
            return ("bridge.%s.%s.%s"):format(bridgeType, info.folder, context), info.folder, info.resource
        end
    end

    return ("bridge.%s.%s.%s"):format(bridgeType, "default", context), "default", "builtin"
end

---@param bridgeType string
---@return table
local function loadBridge(bridgeType)
    local path, folder, resource = getBridge(bridgeType)
    lib.print.debug(('[bridge] %s -> %s (%s, %s)'):format(
        tostring(bridgeType),
        tostring(path),
        tostring(folder),
        tostring(resource)
    ))
    return lib.load(path)
end

local bridgeState = {
    framework = loadBridge('frameworks'),
    gangs = loadBridge('gangs'),
    notifications = loadBridge('notifications'),
    inventory = loadBridge('inventories'),
    hospital = loadBridge('hospital'),
}

if lib.context == 'client' then
    bridgeState.target = loadBridge('targets')
end

-- Anti-cheat bridge.
-- Configured server-side only (via ServerConfig.AntiCheat) so the resource
-- name never gets shipped to clients. ServerConfig is in server_scripts and
-- loads after this shared script, so defer the real load and install a no-op
-- stub immediately to keep every call site safe.
if lib.context == 'server' then
    bridgeState.anticheat = lib.load('bridge.anticheat.default.server')

    CreateThread(function()
        local waited = 0
        while ServerConfig == nil and waited < 5000 do
            Wait(50)
            waited = waited + 50
        end

        local cfg = ServerConfig and ServerConfig.AntiCheat
        if not cfg or not cfg.enabled or not cfg.name or cfg.name == '' then
            return
        end

        if not cfg.folder or cfg.folder == '' then
            lib.print.error('[bridge] anticheat: ServerConfig.AntiCheat.folder is empty; set it to the resource folder name on disk')
            return
        end

        if not GetResourceState(cfg.folder):find('start') then
            lib.print.error(('[bridge] anticheat: resource "%s" is not started'):format(cfg.folder))
            return
        end

        local path = ('bridge.anticheat.%s.server'):format(cfg.name)
        local ok, loaded = pcall(lib.load, path)
        if ok and type(loaded) == 'table' then
            bridgeState.anticheat = loaded
            lib.print.debug(('[bridge] anticheat -> %s (resource: %s)'):format(path, cfg.folder))
        else
            lib.print.error(('[bridge] anticheat: failed to load %s, falling back to default'):format(path))
        end
    end)
end

Bridge = bridgeState
