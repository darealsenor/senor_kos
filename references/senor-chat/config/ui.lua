Config = Config or {}
Config.UI = Config.UI or {}
Config.Presets = {
    enabled = true,
    default = "rp",
    presets = {
        dm = {
            profilePictures = true,
            emojis = true,
            chatTags = true,
            chatColors = true,
            channels = true,
            channelsMode = "outside", -- outside | inline
            soundOnType = true,
            showChatOnNewMessage = false,
            chatLocation = "left-top", -- left-top, center-top, right-top, left-center, center-center, right-center, left-bottom, center-bottom, right-bottom
            chatSize = "medium", -- small, medium, large
            defaultMainColor = 4, -- check the colors Config.UI.ColorPalette
            lockdown = false,
            maxCustomTags = 2,
        },
        rp = {
            profilePictures = false,
            emojis = false,
            chatTags = true,
            chatColors = false,
            channels = true,
            channelsMode = "inline", -- outside | inline
            soundOnType = false,
            showChatOnNewMessage = false,
            chatLocation = "left-top", -- left-top, center-top, right-top, left-center, center-center, right-center, left-bottom, center-bottom, right-bottom
            chatSize = "medium", -- small, medium, large
            defaultMainColor = 1, -- check the colors Config.UI.ColorPalette
            lockdown = true,
            maxCustomTags = 1,
        },
        minimal = {
            profilePictures = false,
            emojis = false,
            chatTags = false,
            chatColors = false,
            channels = false,
            channelsMode = "outside", -- outside | inline
            soundOnType = false,
            showChatOnNewMessage = false,
            chatLocation = "left-top", -- left-top, center-top, right-top, left-center, center-center, right-center, left-bottom, center-bottom, right-bottom
            chatSize = "small", -- small, medium, large
            defaultMainColor = 1, -- check the colors Config.UI.ColorPalette
            lockdown = false,
            maxCustomTags = 0,
        }
    }
}

-- i'd suggest radix ui color OR open-color palettes if you wanna
-- edit those
Config.UI.ColorPalette = {
    { color = "#228be6", name = "Blue", bgColor = "rgba(34, 139, 230, 0.1)", id = 1 },
    { color = "#fd7e14", name = "Orange", bgColor = "rgba(253, 126, 20, 0.1)", id = 2 },
    { color = "#e74c3c", name = "Red", bgColor = "rgba(231, 76, 60, 0.1)", id = 3 },
    { color = "#2ecc71", name = "Green", bgColor = "rgba(46, 204, 113, 0.1)", id = 4 },
    { color = "#9b59b6", name = "Purple", bgColor = "rgba(155, 89, 182, 0.1)", id = 5 },
    { color = "#f1c40f", name = "Yellow", bgColor = "rgba(241, 196, 15, 0.1)", id = 6 },
    { color = "#1abc9c", name = "Teal", bgColor = "rgba(26, 188, 156, 0.1)", id = 7 },
    { color = "#e67e22", name = "Carrot", bgColor = "rgba(230, 126, 34, 0.1)", id = 8 },
}

Config.Avatar = {
    Type = "Discord", -- Discord | Steam, if discord you'd have to set token in discord_config
    FallbackImage = "https://avatars.githubusercontent.com/u/71390173?v=4"
}

Config.NameSource = "Discord" -- RP = framework char name (e.g. firstname lastname) | Steam = native GetPlayerName | Discord = Discord display name (requires token + guild in discord_config)
