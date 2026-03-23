Config = Config or {}

Config.Channels = {
    default = {
        -- change channel_global / accessStaffChannel in locales
        -- folder if you want to change its label, but keep Staf / Global
        -- as is.
        { name = "Global", id = 0, timeout = 3, localeKey = "channel_global" },
        { name = "Staff",  id = 1, timeout = 1, permission = "accessStaffChannel", localeKey = "channel_staff" },
    },
    enabled = true
}
