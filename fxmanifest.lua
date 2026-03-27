fx_version "cerulean"

description "KOS / Gang Fight"
author "6enor - https://senor-scripts.tebex.io/"
version '1.0.0'

lua54 'yes'

dependencies {
  'ox_lib',
  'oxmysql'
}

games {
  "gta5",
}

ui_page 'web/build/index.html'

escrow_ignore {
  'bridge/**',
  'config/*.lua',
  'data/**',
  'client/locale.lua',
}

shared_scripts {
  '@ox_lib/init.lua',
  'config/shared_config.lua',
  'config/gangs_config.lua',
  'config/interaction_config.lua',
  'config/maps.lua',
  'data/events.lua',
  'bridge/config.lua',
  'bridge/init.lua',

}

client_scripts {
  'config/client_config.lua',
  'client/state.lua',
  'client/kill_detection.lua',
  'client/locale.lua',
  'client/utils.lua',
  'client/avatar.lua',
  'client/nui.lua',
  'client/round_announcer.lua',
  'client/spectate.lua',
  'client/interaction.lua',
}

server_scripts {
  '@oxmysql/lib/MySQL.lua',
  'config/server_config.lua',
  'config/avatar_server_config.lua',
  'server/auto_creation_sql.lua',
  'server/version.lua',
  'server/storage.lua',
  'server/utils.lua',
  'server/timer.lua',
  'server/avatar.lua',
  'server/player.lua',
  'server/class.lua',
  'server/match_manager.lua',
  'server/commands.lua',
  'server/nui_callbacks.lua',
  'server/debug.lua',
}

files {
	'web/build/index.html',
	'web/build/**/*',
	'locales/*.json',
	'bridge/**/client.lua',
}
