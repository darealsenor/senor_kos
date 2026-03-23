fx_version "cerulean"

description "Senor Chat made re-made with react for OutLawZ"
author "6enor"
version '1.0.2'

lua54 'yes'

games {
  "gta5",
}

shared_script '@ox_lib/init.lua'

shared_scripts {
  'config/general.lua',
  'config/commands.lua',
  'config/channels.lua',
  'config/ui.lua',
  'config/moderation.lua',
  'config/permissions.lua',
  'config/tags_colors.lua',
  'bridge/config.lua',
  'bridge/init.lua',
}

client_scripts {
  'client/utils.lua',
  'client/nui.lua',
  'client/suggestions.lua',
  'client/channels.lua',
  'client/commands.lua',
  'client/client.lua',
  'compatibility/client.lua'
}

server_scripts {
  '@oxmysql/lib/MySQL.lua',
  'config/discord_config.lua',
  'server/version.lua',
  'server/permissions.lua',
  'server/database.lua',
  'server/discord.lua',
  'server/avatar.lua',
  'server/utils.lua',
  'server/class.lua',
  'server/channels/default.lua',
  'server/channels/gangs.lua',
  'server/channels/admin.lua',
  'server/channels/buckets.lua',
  'server/channels/loader.lua',
  'server/channels.lua',
  'server/tags.lua',
  'server/commands.lua',
  'server/events.lua',
  'server/callbacks.lua',
  'server/suggestions.lua',
  'server/console.lua',
  'server/exports.lua',
  'server/debug.lua',
  'compatibility/server.lua',
}

shared_script 'shared/**/*.lua'

files {
  'web/build/index.html',
  'web/build/**/*',
  "bridge/**/**/client.lua",
  'locales/*.json'
}
ui_page 'web/build/index.html'

-- --  escrow
-- escrow_ignore {
--   'config/**',
--   'bridge/**',
--   'client/utils.lua',
--   'server/utils.lua',
--   'server/version.lua'
-- }

-- open-source
escrow_ignore {
  '**/*.lua',
}
