fx_version "cerulean"

description "Basic React (TypeScript) & Lua Game Scripts Boilerplate"
author "Project Error"
version '1.0.0'
repository 'https://github.com/project-error/fivem-react-boilerplate-lua'

lua54 'yes'

dependencies {
  'ox_lib',
  'oxmysql'
}

games {
  "gta5",
  "rdr3"
}

ui_page 'web/build/index.html'

shared_scripts {
  '@ox_lib/init.lua',
  'config/shared_config.lua',
  'config/maps.lua',
  'data/events.lua',
  'bridge/config.lua',
  'bridge/init.lua',
}

client_scripts {
  'config/client_config.lua',
  'client/state.lua',
  'client/kill_detection.lua',
  'client/utils.lua',
  'client/nui.lua',
  'client/client.lua',
}

server_scripts {
  '@oxmysql/lib/MySQL.lua',
  'config/server_config.lua',
  'server/auto_creation_sql.lua',
  'server/**/*',
}

files {
	'web/build/index.html',
	'web/build/**/*',
	'bridge/**/client.lua',
}