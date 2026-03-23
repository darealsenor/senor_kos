PlayerStats = {}

---Loads a player's stats from DB into in-memory cache. Idempotent per player.
---@param playerId number
---@return boolean|nil isNew true when a new player was loaded (no DB row), nil when already cached or not loaded
function loadPlayerIntoCache(playerId)
    if PlayerStats[playerId] then return nil end
    local identifier = Bridge.framework.GetPlayerIdentifier(playerId)
    if not identifier or identifier == '' then return nil end
    local data, isNew = LoadPlayerStats(identifier)
    if not data then return nil end
    data.sessionStartTime = os.time()
    data.dirty = true
    PlayerStats[playerId] = data
    return isNew
end

---@param playerId number
---@param cached table
---@return table data
local function buildSaveData(playerId, cached)
    local identifier = Bridge.framework.GetPlayerIdentifier(playerId) or cached.identifier
    local sessionDuration = 0
    if cached.sessionStartTime then
        sessionDuration = math.max(0, os.time() - cached.sessionStartTime)
    end

    local steamName = GetPlayerName(playerId)
    local rpName = Bridge.framework.GetPlayerName(playerId)
    if not rpName or rpName == '' then
        rpName = steamName
    end

    local data = {
        identifier = identifier,
        kills = cached.kills or 0,
        deaths = cached.deaths or 0,
        damage = cached.damage or 0,
        headshots = cached.headshots or 0,
        playtime = (cached.playtime or 0) + sessionDuration,
        vehicles = cached.vehicles,
        properties = cached.properties,
        rp_name = rpName,
        steam_name = steamName,
        avatar = cached.avatar,
    }

    local frameworkMoney = Bridge.framework.GetMoney(playerId)
    if frameworkMoney then
        data.money = (frameworkMoney.cash or 0) + (frameworkMoney.bank or 0)
    else
        data.money = cached.money or 0
    end
    local vehicleCount = Bridge.framework.GetVehicles(playerId)
    if vehicleCount then
        data.vehicles = type(vehicleCount) == 'table' and #vehicleCount or vehicleCount
    end
    local propertyCount = Bridge.framework.GetProperties(playerId)
    if propertyCount then
        data.properties = type(propertyCount) == 'table' and #propertyCount or propertyCount
    end

    return data
end

---Builds leaderboard-self shape from cache for a player not yet in DB (or for fallback).
---@param playerId number
---@param totalCount number
---@return table|nil { rank, total, identifier, rp_name, steam_name, avatar, ...stats }
function BuildLeaderboardSelfFromCache(playerId, totalCount)
    local cached = PlayerStats[playerId]
    if not cached then return nil end
    local data = buildSaveData(playerId, cached)
    if not data or not data.identifier then return nil end
    return {
        identifier = data.identifier,
        rp_name = data.rp_name,
        steam_name = data.steam_name,
        avatar = data.avatar,
        kills = data.kills or 0,
        deaths = data.deaths or 0,
        damage = data.damage or 0,
        headshots = data.headshots or 0,
        playtime = data.playtime or 0,
        money = data.money or 0,
        vehicles = data.vehicles,
        properties = data.properties,
        rank = totalCount + 1,
        total = totalCount + 1,
    }
end

---Persists cached stats for a player. Updates cache in place unless clearAfterSave.
---@param playerId number
---@param clearAfterSave boolean
function savePlayerToDb(playerId, clearAfterSave)
    local cached = PlayerStats[playerId]
    if not cached then return end

    local data = buildSaveData(playerId, cached)
    if not data.identifier then return end
    SavePlayerStats(data.identifier, data)

    if clearAfterSave then
        PlayerStats[playerId] = nil
    else
        cached.playtime = data.playtime
        cached.sessionStartTime = os.time()
        cached.money = data.money
        cached.vehicles = data.vehicles
        cached.properties = data.properties
        cached.rp_name = data.rp_name
        cached.steam_name = data.steam_name
        cached.identifier = data.identifier
        cached.avatar = data.avatar
        cached.dirty = false
        cached.dirty = true
    end
end

---Sets avatar for a player in cache and persists to DB. Called when client sends Discord/Steam URL or mugshot data URL.
---@param playerId number
---@param avatarData string|nil URL or data URL (e.g. data:image/png;base64,...)
function SetPlayerAvatar(playerId, avatarData)
    local cached = PlayerStats[playerId]
    if not cached then return end
    if type(avatarData) ~= 'string' or #avatarData == 0 then return end
    cached.avatar = avatarData
    savePlayerToDb(playerId, false)
end

function saveAllCachedPlayers()
    local saved = 0
    for playerId, cached in pairs(PlayerStats) do
        if cached.dirty then
            savePlayerToDb(playerId, false)
            saved = saved + 1
        end
    end
    if saved > 0 then
        lib.print.info('Saved stats for all cached players')
    end
end

lib.cron.new('*/5 * * * *', function()
    saveAllCachedPlayers()
end)

AddEventHandler('txAdmin:events:serverShuttingDown', function()
    saveAllCachedPlayers()
end)

AddEventHandler('txAdmin:events:scheduledRestart', function(eventData)
    if eventData.secondsRemaining == 60 then
        saveAllCachedPlayers()
    end
end)
