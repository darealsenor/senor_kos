
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

Bridge = {
    framework = lib.load(getBridge("frameworks")),
}
