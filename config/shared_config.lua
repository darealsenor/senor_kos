Config = Config or {}
Shared = Shared or {}

lib.locale()


Config.versionCheck = false

Config.Admin = {
    qb = { permissions = { 'qbcore.god', 'admin' } },
    esx = { groups = { 'admin', 'superadmin', 'mod' }, permissions = { 'admin', 'superadmin' } },
    ox = { permissions = { 'admin', 'superadmin' } },
    qbx = { permissions = { 'qbcore.god', 'admin' } },
    default = { permissions = { 'admin', 'command' } },
}

Shared.Spectate = {
    competitive = true,
    players = true,
}
