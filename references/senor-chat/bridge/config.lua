ConfigBridge = {
    ---Resources are checked sequentially. So if you want to prioritize a specific bridge then put it higher in the list.

    frameworks = {
        { resource = "ox_core",     folder = "ox" },
        { resource = "es_extended", folder = "esx" },
        { resource = "qbx-core",    folder = "qbx" },
        { resource = "qb-core",     folder = "qb" }
    },
}
