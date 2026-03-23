fx_version "cerulean"

description "FiveM squads scripts for PvP Servers | https://discord.gg/Z5a9rM7UaG"
author "6enor - https://senor-scripts.tebex.io/"
version '1.1.1'

lua54 'yes'

games {
  "gta5",
}

dependencies {
  'ox_lib',
  'oxmysql'
}

ui_page 'web/build/index.html'

shared_script { '@ox_lib/init.lua', 'config/shared_config.lua', 'bridge/init.lua' }

client_scripts {
  'config/client_config.lua',
  'client/utils.lua',
  'client/nui.lua',
  'client/blips.lua',
  'client/tags.lua',
  'client/group.lua',
  'client/hud.lua',
  'client/squad.lua',
  'client/ping.lua',
  'client/exports.lua',
  -- 'client/tests.lua',
  -- 'client/outlawz.lua' -- this is for my own server, you can use it if you find it helpful but it might not work for everyone
}

server_scripts {
  '@oxmysql/lib/MySQL.lua',
  'config/server_config.lua',
  'server/utils.lua',
  'server/db.lua',
  'server/SquadManager.lua',
  'server/class.lua',
  'server/server.lua',
  -- 'server/tests.lua',
  'server/exports.lua',
  'server/commands.lua',
  'server/version.lua'
  -- 'server/outlawz.lua', -- this is for my own server, you can use it if you find it helpful but it might not work for everyone
}

files {
  'web/build/index.html',
  'web/build/**/*',
  'web/public/pings/*.png',
  'bridge/**/client.lua',
  'locales/*.json'
}

-- open source
escrow_ignore {
  'config/**',
  'bridge/**',
  'locales/**',
  'client/**',
  'server/**',
  'web/**',
  'data/**',
}

-- --escrow 
-- escrow_ignore {
--   'config/**',
--   'bridge/**',
--   'locales/**',
--   'client/utils.lua',
--   'server/utils.lua',
--   'server/db.lua',
--   'client/tests.lua',
--   'server/tests.lua',
--   'client/outlawz.lua',
--   'server/outlawz.lua'
-- }