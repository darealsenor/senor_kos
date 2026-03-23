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

Bridge = {
    framework = lib.load(getBridge('frameworks')),
    appearance = lib.load(getBridge('appearance')),
}
