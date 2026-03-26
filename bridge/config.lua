ConfigBridge = {
    frameworks = {
        { resource = 'ox_core', folder = 'ox' },
        { resource = 'es_extended', folder = 'esx' },
        { resource = 'qbx_core', folder = 'qbx' },
        { resource = 'qb-core', folder = 'qb' },
    },
    gangs = {
        { resource = 'op-crime', folder = 'op_gangs' },
        { resource = 'qbx_core', folder = 'qbx' },
        { resource = 'qb-core', folder = 'qb' },
        { resource = 'core_gangs', folder = 'core_gangs' },
    },
    notifications = {
        { resource = 'ox_lib', folder = 'ox_lib' },
        { resource = 'qbx_core', folder = 'qb' },
        { resource = 'qb-core', folder = 'qb' },
        { resource = 'es_extended', folder = 'esx' },
    },
    hospital = {
        { resource = 'qbx_medical', folder = 'qbx_medical' },
        { resource = 'qb-ambulancejob', folder = 'qb_ambulancejob' },
        { resource = 'esx_ambulancejob', folder = 'esx_ambulancejob' },
        { resource = 'wasabi_ambulance', folder = 'wasabi_ambulance' },
    },
    targets = {
        { resource = "ox_target", folder = "ox" },
        { resource = "qb-target", folder = "qb" }
    }
}
