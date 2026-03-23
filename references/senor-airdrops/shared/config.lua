lib.locale()

Config = {}

ServerConfig = ServerConfig or {}
ServerConfig.VersionCheck = true

Config.DropModel = `tr_prop_tr_mil_crate_02` -- Keep the ticks (``), this is the airdrop model.

Config.Defaults = {
    Distance = 300.0,
    LockTime = 10, -- minutes
    Interaction = "Keystroke", -- Keystorke / Interaction
    -- remove comment to make it default if you'd like
    Settings = {
        -- ['Firstperson'] = 'First-person Only',
        -- ['SemiDamage'] = 'Semi Damage',
    },
    -- for debugging you  can ignore
    FallbackLocation = vector3(279.54, -1937.58, 25.21)
}

Config.Customization = {
    Particle = {
        asset = 'core',
        effectName = "exp_grd_flare",
        alpha = 0.8,
        scale = 0.75,
        zOffset = -5.0,
        rotation = { x = 0.0, y = 0.0, z = 0.0 },
        color = { r = 125.0, g = 40.0, b = 220.0 }
    },
    Blip = {
        color = 2,   -- https://docs.fivem.net/docs/game-references/blips/#blip-colors
        sprite = 90, -- https://docs.fivem.net/docs/game-references/blips/#blips
        scale = 0.8,
        shortRange = true,
        name = locale('blip_name'),
        Sprites = {
            Regular = 90,
            Pistols = 156
        }
    },
    Radius = {
        color = 2, -- https://docs.fivem.net/docs/game-references/blips/#blip-colors
        alpha = 100,
        name = locale('blip_name'),
        offset = 0.0
    }
}

Config.BlipColorChanges = {
    WarningTime = 240, -- seconds
    WarningColor = 44, -- https://docs.fivem.net/docs/game-references/blips/#blip-colors
    CriticalTime = 60, -- seconds
    CriticalColor = 6 -- https://docs.fivem.net/docs/game-references/blips/#blip-colors
}

Config.Commands = {
    Main = 'airdrops',
    Drops = 'createdrop',
    DropsHelp = locale('command_drops_help')
}

Config.Interaction = {
    MaxDistance = 5.0,
    KeystrokeDistance = 3.0,
    -- if you want it as E make it 38, E down below.
    KeystrokeControl = 49, -- https://docs.fivem.net/docs/game-references/controls/
    KeystrokeKey = 'F' -- a display for the Key (49) for example. 
}

Config.Settings = {
    FirstPerson = {
        UpdateInterval = 300, -- milliseconds
        ViewMode = 4
    },
    SemiDamage = {
        FullDamage = 1.0,
        HalfDamage = 0.5
    }
}

-- My server had like flying vehicle, so people would come late flying, this why
-- this option was implemented, you can enable it - up to you.
Config.VehicleLimiter = {
    Enabled = false,
    CheckInterval = 1000, -- milliseconds
    WarningTime = 240, -- seconds
    CriticalTime = 60, -- seconds
    DamageAmount = 10,
    DisableEngineOnCritical = true
}

-- My server had like 24/7 drops and people would get rich over-night.
-- When server was empty, they'd just farm airdrops and stack items like crazy.
-- This reduces prize amounts when there aren't enough players online to make it competitive.
-- If there's less than MinPlayers online, prizes get divided by Divisor to prevent easy farming.
Config.PrizeReduction = {
    Enabled = true, -- Enable/disable prize reduction system
    MinPlayers = 20, -- Minimum players online to give full prizes (if less, prizes get reduced)
    MinAmount = 2, -- If prize amount is <= this, skip it entirely when reducing (prevents giving 1 item that gets rounded down)
    Divisor = 3, -- Divide prize amount by this number when there aren't enough players (e.g. 30 items / 3 = 10 items)
    MinReducedAmount = 1 -- Minimum amount to give after reduction (if reduction would give less, skip the prize)
}

Config.AutoDrop = {
    Enabled = true,
    MaxConcurrentDrops = 4,
    CreationInterval = 300, -- seconds
    DefaultLockTime = 10, -- minutes
    DefaultDistance = 300.0,
    DefaultWeapons = nil,
    WeaponRandomThreshold = 5,
    WeaponRandomMax = 10
}

-- dont touch
Config.Timer = {
    CheckInterval = 100,
    CountdownUpdateInterval = 1000
}

Config.AutoRemoveAfterUnlockDelay = 60 -- seconds

Config.LocationCheckIntersectionDistance = 300.0

Config.Admin = {
    qb = {
        permissions = { 'qbcore.god', 'admin' },
    },
    esx = {
        permissions = { 'admin', 'superadmin' },
    },
    ox = {
        permissions = { 'admin', 'superadmin' },
    },
    qbx = {
        permissions = { 'qbcore.god', 'admin' },
    },
    default = {
        permissions = { 'admin', 'command' },
    },
}

Config.Theme = {
    Mode = "dark", -- todo: fix the light it doesn't work and who tf uses light mode anyways

    -- these colours goes well since thats shadcn: https://ui.shadcn.com/themes#themes
    Background = { h = 224, s = 71.4, l = 4.1 },
    Border = { h = 142, s = 70, l = 50 },
    Primary = { h = 142.1, s = 76.2, l = 36.3 }
}
