---@param bridgeType string Bridge type from config.lua
---@return string
local function getBridge(bridgeType)
    local context = lib.context
    local bridge = ConfigBridge[bridgeType]

    for i=1, #bridge do
        local info = bridge[i]
        if GetResourceState(info.resource):find("start") then
            return ("bridge.%s.%s.%s"):format(bridgeType, info.folder, context)
        end
    end

    return ("bridge.%s.%s.%s"):format(bridgeType, "default", context)
end

local bridgeState = {
    framework = lib.load(getBridge('frameworks')),
    gangs = lib.load(getBridge('gangs')),
    notifications = lib.load(getBridge('notifications')),
    hospital = lib.load(getBridge('hospital')),
}

if lib.context == 'client' then
    bridgeState.target = lib.load(getBridge('targets'))
end

Bridge = bridgeState
