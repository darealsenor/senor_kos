lib.locale() -- don't touch please - it will break ox_lib locale system.
Config = {}

--[[
    ╔══════════════════════════════════════════════════════════════════════════╗
    ║                          COLOR PRESETS                                   ║
    ║  Pick one preset below and copy its values into Config.Design.           ║
    ║  (https://yeun.github.io/open-color)
    ╚══════════════════════════════════════════════════════════════════════════╝

    TEAL (default — matches the current custom #00FFAE theme)
        primaryColor = '#20c997'   buttonBg = '#0ca678'
        bgAccent     = 'rgba(32, 201, 151, 0.05)'
        validGradient = 'linear-gradient(90deg, rgba(32, 201, 151, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)'

    CYAN
        primaryColor = '#22b8cf'   buttonBg = '#1098ad'
        bgAccent     = 'rgba(34, 184, 207, 0.05)'
        validGradient = 'linear-gradient(90deg, rgba(34, 184, 207, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)'

    BLUE
        primaryColor = '#339af0'   buttonBg = '#1c7ed6'
        bgAccent     = 'rgba(51, 154, 240, 0.05)'
        validGradient = 'linear-gradient(90deg, rgba(51, 154, 240, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)'

    INDIGO
        primaryColor = '#5c7cfa'   buttonBg = '#4263eb'
        bgAccent     = 'rgba(92, 124, 250, 0.05)'
        validGradient = 'linear-gradient(90deg, rgba(92, 124, 250, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)'

    VIOLET
        primaryColor = '#845ef7'   buttonBg = '#7048e8'
        bgAccent     = 'rgba(132, 94, 247, 0.05)'
        validGradient = 'linear-gradient(90deg, rgba(132, 94, 247, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)'

    GRAPE
        primaryColor = '#cc5de8'   buttonBg = '#ae3ec9'
        bgAccent     = 'rgba(204, 93, 232, 0.05)'
        validGradient = 'linear-gradient(90deg, rgba(204, 93, 232, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)'

    PINK
        primaryColor = '#f06595'   buttonBg = '#d6336c'
        bgAccent     = 'rgba(240, 101, 149, 0.05)'
        validGradient = 'linear-gradient(90deg, rgba(240, 101, 149, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)'

    RED
        primaryColor = '#ff6b6b'   buttonBg = '#f03e3e'
        bgAccent     = 'rgba(255, 107, 107, 0.05)'
        validGradient = 'linear-gradient(90deg, rgba(255, 107, 107, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)'

    ORANGE
        primaryColor = '#ff922b'   buttonBg = '#f76707'
        bgAccent     = 'rgba(255, 146, 43, 0.05)'
        validGradient = 'linear-gradient(90deg, rgba(255, 146, 43, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)'

    YELLOW
        primaryColor = '#fcc419'   buttonBg = '#f59f00'
        bgAccent     = 'rgba(252, 196, 25, 0.05)'
        validGradient = 'linear-gradient(90deg, rgba(252, 196, 25, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)'

    LIME
        primaryColor = '#94d82d'   buttonBg = '#74b816'
        bgAccent     = 'rgba(148, 216, 45, 0.05)'
        validGradient = 'linear-gradient(90deg, rgba(148, 216, 45, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)'

    GREEN
        primaryColor = '#51cf66'   buttonBg = '#37b24d'
        bgAccent     = 'rgba(81, 207, 102, 0.05)'
        validGradient = 'linear-gradient(90deg, rgba(81, 207, 102, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)'
]]

Config.Design = {
    primaryColor          = '#00FFAE',                                                                             -- | # Primary / Global Color - Used for text, borders, and accents throughout the UI
    buttonBg              = '#00CB8A',                                                                             -- | # Primary Button Color - Used for sidebar and primary action buttons
    textGradient          =
    'background: linear-gradient(90deg, rgba(255, 255, 255, 0.75) 0%, rgba(153, 153, 153, 0.75) 100%)',            -- | # Foreground Text Gradient - Used for text styling
    containerBackground   = 'linear-gradient(360deg, #0B0B0B 0%, #101A17 100%)',                                   -- | # Background Gradient - Main container background (popover/card)
    bgAccent              = 'rgba(0, 255, 174, 0.05)',                                                             -- | # Background Accent - Primary color with opacity, used for toggle buttons and accents
    validGradient         = 'linear-gradient(90deg, rgba(0, 255, 174, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)', -- | # Valid Gradient - Used for valid input fields and selected items
    joinButton            = 'rgba(136, 0, 255, 0.1)',                                                             -- | # Join Button - Background color for join squad buttons
    backAccent            =
    'rgba(255, 0, 0, 0.05)'                                                                                        -- | # Back Accent - Used for exit/back buttons and destructive actions
}

Config.Settings = {
    ['Menu_Command']       = 'squads', -- | # In this section, you can set the command that players will open the squad menu.
    ['Relations']          = true, -- | # In this section Squad players will be in a team and won't be able to make damage to each other
    ['Blips']              = true, -- | # In this section Squad players will have blips of each other
    ['Hud']                = true, -- | # In this section Squad players will have team hud

    -- Tags/Show Names
    ['Tags']               = true, -- | # In this section Squad players will Tags on (name above head)
    ['TagsDistance']       = 50.0, -- | # In this section you will be able to set the distance in the Show-Names
    ['TagColor']           = 18, --  | # Name color:https://docs.fivem.net/docs/game-references/hud-colors/

    -- Ping System
    ['Pings']              = true, -- | # Enable the squad ping system (middle mouse button)
    ['PingHoldMs']         = 500, -- | # Milliseconds to hold before the radial wheel opens (vs quick tap ping)
    ['PingTTL']            = 15, -- | # How many seconds a location ping marker stays visible in the world
    ['PingFollowingTTL']   = 4, -- | # How many seconds an entity (player/vehicle) ping tracks and stays visible
    ['PingCooldownMs']     = 1000, -- | # Minimum milliseconds between pings (spam protection)

    -- Ping Icon Size
    ['PingIconMinSize']    = 0.012, -- | # Minimum icon scale (closest distance)
    ['PingIconMaxSize']    = 0.035, -- | # Maximum icon scale (furthest distance)
    ['PingIconScale']      = 1.0, -- | # Scale divisor — higher = bigger icons at any distance

    -- Ping Notification
    ['PingNotify']         = true,        -- | # Show a notification when a squad member pings
    ['PingNotifyPosition'] = 'top-right', -- | # Notification position: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
    ['PingNotifyDuration'] = 4000,        -- | # How long the ping notification stays on screen (ms)

    -- Ping Sound
    ['PingSound']          = true,                            -- | # Play a sound when a ping is received
    ['PingSoundName']      = 'Waypoint_Set',                  -- | # GTA frontend sound name
    ['PingSoundSet']       = 'HUD_FRONTEND_DEFAULT_SOUNDSET', -- | # GTA frontend sound set
    -- Other sound options:
    -- ['PingSoundName'] = 'CONFIRM_BEEP'            ['PingSoundSet'] = 'HUD_MINI_GAME_SOUNDSET'          -- subtle beep (same as squad chat)
    -- ['PingSoundName'] = 'RADAR_GPS_NEW_TARGET'    ['PingSoundSet'] = 'HUD_FRONTEND_DEFAULT_SOUNDSET'   -- GPS target acquired
    -- ['PingSoundName'] = 'TIMER_STOP'              ['PingSoundSet'] = 'HUD_MINI_GAME_SOUNDSET'          -- timer stop click
    -- ['PingSoundName'] = 'SELECT'                  ['PingSoundSet'] = 'HUD_FRONTEND_DEFAULT_SOUNDSET'   -- menu select
    -- ['PingSoundName'] = 'BACK'                    ['PingSoundSet'] = 'HUD_FRONTEND_DEFAULT_SOUNDSET'   -- menu back
}

Config.DefaultSettings = {
    hudOpen = true,                                -- | # Show/Hide HUD by default
    showNameTags = true,                           -- | # Show/Hide Nametags by default
    showBlips = true,                              -- | # Show/Hide Blips by default
    blipsColor = { hex = '#00FFFF', fivemId = 6 }, -- | # Default blip color (hex and FiveM color ID)
    chatNotifications = true,                      -- | # Squad chat notifications enabled by default
    hudMaxDisplayMode = 'infinity',                -- | # HUD max display mode: 'infinity' or 'number'
    hudMaxDisplayValue = 4,                        -- | # HUD max display value (when mode is 'number')
    hudMinimized = false,                          -- | # HUD minimized mode by default
    showRadioIcon = true,                          -- | # Show radio/talking icon by default
    hudHealthColor = 'rgba(255, 255, 255, 1)',     -- | # Default HUD health color
    hudArmorColor = '#0084FF',                     -- | # Default HUD armor color
    hudLtr = false,                                -- | # HUD left-to-right layout by default
    hudPosition = { x = 0, y = 0 },                -- | # Default HUD position (x, y)
    scale = 1.0,                                   -- | # Default scale (Disabled for nowss)
}
