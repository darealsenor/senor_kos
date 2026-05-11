Config = Config or {}
Shared = Shared or {}

lib.locale()


Config.versionCheck = true

Config.Admin = {
    qb = { permissions = { 'qbcore.god', 'admin' } },
    esx = { groups = { 'admin', 'superadmin', 'mod' }, permissions = { 'admin', 'superadmin' } },
    ox = { permissions = { 'admin', 'superadmin' } },
    qbx = { permissions = { 'qbcore.god', 'admin' } },
    default = { permissions = { 'admin', 'command' } },
}

Shared.Spectate = {
    competitive = true,
    players = true, -- players can spectate via /kos or interaction command
    keys = {
        prev = 'LEFT',  -- previous target
        next = 'RIGHT', -- next target
        stop = 'BACK',  -- exit spectate
    },
}

Shared.Loadouts = {
    pistol_50 = {
        label = 'Pistol 50 Loadout',
        items = {
            { name = 'weapon_pistol', amount = 1, metadata = { ammo = 12} },
            { name = 'ammo-9', amount = 300 },
        },
    },
    rifle = {
        label = 'Rifle Loadout',
        items = {
            { name = 'weapon_carbinerifle', amount = 1, metadata = { ammo = 30 } },
            { name = 'ammo-rifle', amount = 120 },
        },
    },
}
