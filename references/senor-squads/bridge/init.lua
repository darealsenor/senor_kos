ConfigBridge = {
    frameworks = {
        { resource = "qbx_core", folder = "qbx" },
        { resource = "qb-core", folder = "qbcore" },
        { resource = "ox_core", folder = "ox" },
        { resource = "es_extended", folder = "esx" },
    },
}

local function getBridge(bridgeType)
    local context = IsDuplicityVersion() and "server" or "client"
    local bridge = ConfigBridge[bridgeType]

    for i = 1, #bridge do
        local info = bridge[i]
        if GetResourceState(info.resource):find("start") then
            print(info.resource)
            return ("bridge.%s.%s.%s"):format(bridgeType, info.folder, context)
        end
    end

    return ("bridge.%s.%s.%s"):format(bridgeType, "default", context)
end

Bridge = {
    F = lib.load(getBridge("frameworks")),
}
