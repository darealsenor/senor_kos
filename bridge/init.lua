local function getBridge(bridgeType)
    local context = lib.context
    local bridge = ConfigBridge[bridgeType]

    for i = 1, #bridge do
        local info = bridge[i]
        if GetResourceState(info.resource):find('start') then
            return ('bridge.%s.%s.%s'):format(bridgeType, info.folder, context)
        end
    end

    return ('bridge.%s.default.%s'):format(bridgeType, context)
end

---@param bridgeType string
---@return unknown
local function loadBridge(bridgeType)
    if IsDuplicityVersion() then
        return lib.load(getBridge(bridgeType))
    end
    return lib.load(('bridge.%s.default.client'):format(bridgeType))
end

Bridge = {
    framework = loadBridge('frameworks'),
    gangs = loadBridge('gangs'),
    notifications = loadBridge('notifications'),
    hospital = loadBridge('hospital'),
}
