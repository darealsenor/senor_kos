fx_version "cerulean"

description "advanced airdrops system"
author "6enor - https://senor-scripts.tebex.io/"
version '1.0.0'

lua54 'yes'

games {
    "gta5",
}

ui_page 'web/build/index.html'

shared_scripts {
    '@ox_lib/init.lua',
    'shared/*.lua',
    'bridge/config.lua',
    'bridge/init.lua'
}

client_scripts {
    'client/ui/nui.lua',

    'client/core/events.lua',
    'client/features/drop/afterdrop.lua',
    'client/features/drop/bucket.lua',
    'client/utils/cache.lua'
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server/core/commands.lua',
    'server/core/events.lua',
    'server/core/exports.lua',
    'server/features/auto_drop_creation.lua',
    'server/utils/sql.lua',
    'server/version.lua'
}

files {
    'web/build/index.html',
    'web/build/**/*',
    'client/core/drops.lua',
    'client/features/drop/limiter.lua',
    'client/features/settings/*.lua',
    'client/features/vehicle/limiter.lua',
    'client/features/weapon/limiter.lua',
    'client/features/drop/indicator.lua',
    'client/features/drop/blip.lua',
    'client/pickup/*.lua',
    'client/services/*.lua',
    'client/utils/utils.lua',
    "bridge/**/**/client.lua",
    'locales/*.json'
}
