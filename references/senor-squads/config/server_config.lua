ServerConfig = {}

ServerConfig.NameOptions = {
    Types = {
        IC = "IC_NAME",
        Steam = "STEAM_NAME"
    },

    DefaultName = "STEAM_NAME"
}

ServerConfig.ProfileOptions = {
    Types = {
        Steam = "STEAM",
        Discord = "DISCORD",
        -- MAYBE ADD MUGSHOT?
    },

    DefaultPicture = "STEAM",
}

ServerConfig.Tokens = {
    DiscordToken = '', -- Used for Profile Picture
    DiscordGuild = '', -- Used for Profile Picture
}

ServerConfig.AdminCommandPermission = 'group.admin' -- | # ACE permission for admin commands (e.g., 'group.admin', 'command.squads.admin', or false to disable restriction)

ServerConfig.VersionCheck = true -- | # Will alert you for potential updates in the console

ServerConfig.PersistentSquads = true -- | # Save squads to the database so they survive server restarts. Requires oxmysql.

ServerConfig.AutoCloseSquadOnLeaderLeave = false -- | # When true and PersistentSquads is false, deleting the squad when the leader leaves instead of transferring ownership.

ServerConfig.SquadExpiryDays = 0 -- | # Automatically delete squads that have been inactive for this many days. Set to 0 to disable.

ServerConfig.PingCooldownMs = 1000 -- | # Minimum milliseconds between pings per player (server-side spam protection)