fx_version "cerulean"

description "Redzones"
author "6enor - SENOR"
version '1.0.1'

lua54 'yes'

-- -- escrow
-- escrow_ignore {
--     'bridge/**/*.lua',
--     'client/nui.lua',
--     'config/**/*.lua',
--     'data/**/*.lua',
--     'locales/**/*.json',
-- }

-- open source
escrow_ignore {
    'bridge/**/*.lua',
    'client/**/*.lua',
    'config/**/*.lua',
    'data/**/*.lua',
    'server/**/*.lua',
    'locales/**/*.json',
}

dependencies {
    'ox_lib',
    'oxmysql',
}

games {
  "gta5",
}

ui_page 'web/build/index.html'

shared_scripts {
    '@ox_lib/init.lua',
    'config/shared.lua',
    'bridge/config.lua',
    'bridge/init.lua',
    'data/locale.lua',
    'data/events.lua',
}
client_scripts {
    'config/themes.lua',
    'config/client.lua',
    'client/zones/state.lua',
    'client/zones/blips.lua',
    'client/zones/markers.lua',
    'client/zones/zone.lua',
    'client/zones.lua',
    'client/nui.lua',
    'client/cleanup.lua',
    'client/kill_detection.lua',
    'client/respawn.lua',
    'client/placement.lua',
    'client/exports.lua',
}
server_scripts {
    'config/server.lua',
    '@oxmysql/lib/MySQL.lua',
    'server/preset_zones.lua',
    'server/sql.lua',
    'server/redzone.lua',
    'server/manager.lua',
    'server/loadout.lua',
    'server/guard_items.lua',
    'server/respawn.lua',
    'server/logger.lua',
    'server/version.lua',
    'server/loader.lua',
    'server/events.lua',
    'server/commands.lua',
    'server/callbacks.lua',
    'server/exports.lua',
}

files {
    'web/build/index.html',
    'web/build/**/*',
    'bridge/**/*.lua',
    'config/**/*.lua',
    'data/**/*.lua',
    'client/**/*.lua',
    'locales/*.json',
}