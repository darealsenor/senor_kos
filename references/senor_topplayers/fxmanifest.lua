game "gta5"
lua54 "yes"
fx_version "cerulean"
use_experimental_fxv2_oal "yes"

name "SENOR TOP PLAYERS"
author "SENOR"
version "1.0.1"

-- -- escrow
-- escrow_ignore {
--   'bridge/**/*.lua',
--   'client/utils.lua',
--   'config/*.lua',
--   'data/*.lua',
--   'locales/*.json',
-- }

-- open source
escrow_ignore {
  'locales/**/*.json',
  'config/**/*.lua',
  'data/**/*.lua',
  'bridge/**/*.lua',
  'server/**/*.lua',
  'client/*.lua',
}

files {
  'web/build/index.html',
  'web/build/**/*',
  'bridge/**/*.lua',
  'client/**/*.lua',
  'locales/*.json',
  'stream/*.ydr',
  'stream/*.ytyp',
  'stream/*.ymap',
  'stream/*.ybn',
  'stream/*.meta'
}


data_file 'DLC_ITYP_REQUEST' 'stream/rcnk_podium.ytyp'

shared_scripts {
  '@ox_lib/init.lua',
  'data/locale.lua',
  'bridge/config.lua',
  'bridge/init.lua',
  'config/config.lua',
  'config/constants.lua',
  'config/avatar.lua',
}

dependencies {
  'ox_lib',
  'oxmysql',
}

client_scripts {
  'client/state.lua',
  'client/utils.lua',
  'client/podium.lua',
  'client/client.lua',
  'client/avatar.lua',
  'client/placement.lua',
  'client/admin.lua',
  'client/leaderboard.lua',
}

server_scripts {
  '@oxmysql/lib/MySQL.lua',
  'server/version.lua',
  'server/storage/stats.lua',
  'server/storage/leaderboard.lua',
  'server/storage/props.lua',
  'server/storage/peds.lua',
  'server/player.lua',
  'server/leaderboard.lua',
  'server/podium.lua',
  'server/avatar.lua',
  'server/events.lua',
  'server/combat.lua',
  'server/exports.lua',
  'server/commands.lua',
  'server/admin.lua',
}

ui_page 'web/build/index.html'