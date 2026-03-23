local SERVER_STATS_TTL_SEC = (Config.cache and Config.cache.serverStatsTtlSec) or 60
local serverStatsCache = { serverStats = nil, cachedAt = 0 }

local function getCachedServerStats()
    local now = os.time()
    if serverStatsCache.serverStats and (now - serverStatsCache.cachedAt) < SERVER_STATS_TTL_SEC then
        return serverStatsCache.serverStats
    end
    serverStatsCache.serverStats = GetServerStats()
    serverStatsCache.cachedAt = now
    return serverStatsCache.serverStats
end

lib.addCommand(Config.commands.leaderboard.name, {
    help = locale('cmd_leaderboard_help'),
}, function(source, _args, _raw)
    TriggerClientEvent('senor_topplayers:leaderboard:open', source)
end)

lib.callback.register('senor_topplayers:server:GetLeaderboard', function(source, payload)
    local sortBy = DEFAULT_STAT_CATEGORY
    if type(payload) == 'table' and payload.sortBy and ALLOWED_STAT_FIELDS[payload.sortBy] then
        sortBy = payload.sortBy
    end

    local defaultLimit = (Config.leaderboard and Config.leaderboard.defaultLimit) or 25
    local maxLimit = (Config.leaderboard and Config.leaderboard.maxLimit) or 100

    local limit = defaultLimit
    if type(payload) == 'table' and type(payload.limit) == 'number' then
        limit = math.max(1, math.min(maxLimit, payload.limit))
    end

    local page = 1
    if type(payload) == 'table' and type(payload.page) == 'number' and payload.page >= 1 then
        page = math.floor(payload.page)
    end

    local search = nil
    if type(payload) == 'table' and type(payload.search) == 'string' then
        local trimmed = payload.search:match('^%s*(.-)%s*$')
        if #trimmed > 0 then
            search = trimmed
        end
    end

    local offset = (page - 1) * limit
    local result = GetLeaderboardPage(sortBy, limit, offset, search)
    result.serverStats = getCachedServerStats()
    return result
end)

lib.callback.register('senor_topplayers:server:GetLeaderboardSelf', function(source, payload)
    local isNew = loadPlayerIntoCache(source)
    if isNew then
        CreateThread(function()
            Wait(0)
            savePlayerToDb(source, false)
        end)
    end
    local sortBy = DEFAULT_STAT_CATEGORY
    if type(payload) == 'table' and payload.sortBy and ALLOWED_STAT_FIELDS[payload.sortBy] then
        sortBy = payload.sortBy
    end
    local identifier = Bridge.framework.GetPlayerIdentifier(source)
    if not identifier or identifier == '' then return nil end
    local selfData = GetLeaderboardSelf(identifier, sortBy)
    if selfData then return selfData end
    local totalCount = GetLeaderboardTotalCount()
    return BuildLeaderboardSelfFromCache(source, totalCount)
end)
