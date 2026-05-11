ServerConfig = {}

ServerConfig.Timer = {
    CheckInterval = 500,
}

ServerConfig.KOS = {
    RoundDurationSeconds = 3 * 60,
    MatchCleanupDurationSeconds = 10 * 60,
    RespawnDelayAfterRoundBreakMs = 650,
    RespawnDelayAfterTeleportMs = 2000,
    Buckets = {
        Enabled = true,
        StartAt = 5000,
    },
}

-- Anti-cheat bridge.
-- Some anti-cheats ban players for spectating teammates or for being revived
-- without going through their own death flow. This grants short-lived bypasses
-- around those actions so legitimate KOS gameplay does not trip detections.
--
-- Configured here (server_scripts only) so the anti-cheat resource name is
-- never shipped to clients.
--
-- Supported folders (drop-in implementations live in bridge/anticheat/<folder>):
--   'waveshield'  - WaveShield (verified against the v4 developer docs)
--   'default'     - your own anticheat (no-op template; edit server.lua)
--   ''            - disabled (default)
--
-- The exact export/event names used by each anti-cheat can change between
-- versions. Open the matching bridge/anticheat/<folder>/server.lua and confirm
-- the calls match the API of the build you are running.
ServerConfig.AntiCheat = {
    enabled = false,
    folder = '',
    -- ms each bypass window stays open after the protected action fires.
    -- Long enough for the AC to observe the resulting events, short enough
    -- that it cannot be abused if a bypass call leaks.
    BypassWindowMs = 3000,
}
