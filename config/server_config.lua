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
-- `name` picks the bridge implementation. Drop-ins live in
-- bridge/anticheat/<name>/server.lua. Supported:
--   'waveshield'  - WaveShield (verified against the v4 developer docs)
--   'fiveguard'   - FiveGuard (uses SetTempPermission + ACE permissions)
--   'default'     - your own anti-cheat (no-op template; edit server.lua)
--   ''            - disabled (default)
--
-- `folder` is the actual resource folder name on your server, used inside
-- exports[...] calls. Set it to whatever you named the resource folder on
-- disk. Common defaults:
--   WaveShield: 'WaveShield'
--   FiveGuard:  'fiveguard'
--
-- The exact export/event names used by each anti-cheat can change between
-- versions. Open the matching bridge/anticheat/<name>/server.lua and confirm
-- the calls match the API of the build you are running.
ServerConfig.AntiCheat = {
    enabled = false,
    name = '',
    folder = '',
    -- ms each bypass window stays open after the protected action fires.
    -- Long enough for the AC to observe the resulting events, short enough
    -- that it cannot be abused if a bypass call leaks.
    BypassWindowMs = 3000,
}
