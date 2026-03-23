local TOTAL_COUNT_TTL_SEC = (Config.cache and Config.cache.leaderboardTotalCountTtlSec) or 60
local totalCountCache = { count = nil, cachedAt = 0 }

local function getCachedTotalCount()
    local now = os.time()
    if totalCountCache.count ~= nil and (now - totalCountCache.cachedAt) < TOTAL_COUNT_TTL_SEC then
        return totalCountCache.count
    end
    local totalResult = MySQL.single.await('SELECT COUNT(*) AS total FROM senor_topplayers_stats', {})
    totalCountCache.count = totalResult and (tonumber(totalResult.total) or 0) or 0
    totalCountCache.cachedAt = now
    return totalCountCache.count
end

---@return number
function GetLeaderboardTotalCount()
    return getCachedTotalCount() or 0
end

local function rowToEntry(row)
    return {
        identifier = row.identifier and tostring(row.identifier) or nil,
        rp_name = row.rp_name and tostring(row.rp_name) or nil,
        steam_name = row.steam_name and tostring(row.steam_name) or nil,
        avatar = row.avatar and tostring(row.avatar) or nil,
        kills = tonumber(row.kills) or 0,
        deaths = tonumber(row.deaths) or 0,
        damage = tonumber(row.damage) or 0,
        headshots = tonumber(row.headshots) or 0,
        playtime = tonumber(row.playtime) or 0,
        money = tonumber(row.money) or 0,
        vehicles = row.vehicles and tonumber(row.vehicles) or nil,
        properties = row.properties and tonumber(row.properties) or nil,
    }
end

---Fetches one page of leaderboard rows and total count. sortBy is whitelisted; limit/offset are applied.
---@param sortBy string
---@param limit number
---@param offset number
---@param search string|nil
---@return table
function GetLeaderboardPage(sortBy, limit, offset, search)
    if not ALLOWED_STAT_FIELDS[sortBy] then
        sortBy = DEFAULT_STAT_CATEGORY
    end
    limit = math.max(1, math.min(100, tonumber(limit) or 25))
    offset = math.max(0, tonumber(offset) or 0)

    local whereClause = ''
    local whereParams = {}
    if search and type(search) == 'string' and #search > 0 then
        local pattern = ('%%%s%%'):format(search:gsub('%%', '%%%%'):gsub('_', '\\_'))
        whereClause = ' WHERE (rp_name LIKE ? OR steam_name LIKE ?)'
        whereParams = { pattern, pattern }
    end

    local countSql = 'SELECT COUNT(*) AS total FROM senor_topplayers_stats' .. whereClause
    local countResult = MySQL.single.await(countSql, whereParams)
    local total = countResult and (tonumber(countResult.total) or 0) or 0

    local orderColumn = sortBy
    local dataSql = ('SELECT identifier, rp_name, steam_name, avatar, kills, deaths, damage, headshots, playtime, money, vehicles, properties FROM senor_topplayers_stats%s ORDER BY %s DESC LIMIT ? OFFSET ?'):format(whereClause, orderColumn)
    local dataParams = {}
    for _, v in ipairs(whereParams) do
        dataParams[#dataParams + 1] = v
    end
    dataParams[#dataParams + 1] = limit
    dataParams[#dataParams + 1] = offset

    local rows = MySQL.query.await(dataSql, dataParams) or {}
    local entries = {}
    for _, row in ipairs(rows) do
        entries[#entries + 1] = rowToEntry(row)
    end

    return { entries = entries, total = total }
end

---Returns server-wide aggregate stats (totals across all players).
---@return table { kills, deaths, damage, headshots, playtime, money, vehicles, properties, players }
function GetServerStats()
    local row = MySQL.single.await([[
        SELECT
            COALESCE(SUM(kills), 0) AS kills,
            COALESCE(SUM(deaths), 0) AS deaths,
            COALESCE(SUM(damage), 0) AS damage,
            COALESCE(SUM(headshots), 0) AS headshots,
            COALESCE(SUM(playtime), 0) AS playtime,
            COALESCE(SUM(money), 0) AS money,
            COALESCE(SUM(COALESCE(vehicles, 0)), 0) AS vehicles,
            COALESCE(SUM(COALESCE(properties, 0)), 0) AS properties,
            COUNT(*) AS players
        FROM senor_topplayers_stats
    ]])
    if not row then
        return {
            kills = 0, deaths = 0, damage = 0, headshots = 0,
            playtime = 0, money = 0, vehicles = 0, properties = 0, players = 0,
        }
    end
    return {
        kills = tonumber(row.kills) or 0,
        deaths = tonumber(row.deaths) or 0,
        damage = tonumber(row.damage) or 0,
        headshots = tonumber(row.headshots) or 0,
        playtime = tonumber(row.playtime) or 0,
        money = tonumber(row.money) or 0,
        vehicles = tonumber(row.vehicles) or 0,
        properties = tonumber(row.properties) or 0,
        players = tonumber(row.players) or 0,
    }
end
---@param identifier string
---@param sortBy string
---@return table|nil { rank = number, total = number, rp_name = string|nil, ...stats }
function GetLeaderboardSelf(identifier, sortBy)
    if not identifier or type(identifier) ~= 'string' or identifier == '' then return nil end
    if not ALLOWED_STAT_FIELDS[sortBy] then
        sortBy = DEFAULT_STAT_CATEGORY
    end
    local row = MySQL.single.await('SELECT identifier, rp_name, steam_name, avatar, kills, deaths, damage, headshots, playtime, money, vehicles, properties, ' .. sortBy .. ' AS sort_val FROM senor_topplayers_stats WHERE identifier = ?', { identifier })
    if not row then return nil end
    local total = getCachedTotalCount()
    local sortVal = row.sort_val
    local rank
    if sortVal == nil then
        rank = total
    else
        local rankResult = MySQL.single.await('SELECT COUNT(*) AS cnt FROM senor_topplayers_stats WHERE ' .. sortBy .. ' >= ?', { sortVal })
        rank = rankResult and (tonumber(rankResult.cnt) or 0) or 0
    end
    local entry = rowToEntry(row)
    entry.rank = rank
    entry.total = total
    return entry
end

---Searches stats by identifier (exact), rp_name or steam_name (LIKE). For admin ped "spawn by player".
---@param query string
---@return table[] { identifier, rp_name, steam_name }
function SearchPlayers(query)
    if not query or type(query) ~= 'string' or #query == 0 then return {} end
    local trimmed = query:match('^%s*(.-)%s*$') or query
    if #trimmed == 0 then return {} end
    local pattern = ('%%%s%%'):format(trimmed:gsub('%%', '%%%%'):gsub('_', '\\_'))
    local rows = MySQL.query.await([[
        SELECT identifier, rp_name, steam_name FROM senor_topplayers_stats
        WHERE identifier = ? OR rp_name LIKE ? OR steam_name LIKE ?
        LIMIT 20
    ]], { trimmed, pattern, pattern }) or {}
    local out = {}
    for _, row in ipairs(rows) do
        out[#out + 1] = {
            identifier = row.identifier and tostring(row.identifier) or nil,
            rp_name = row.rp_name and tostring(row.rp_name) or nil,
            steam_name = row.steam_name and tostring(row.steam_name) or nil,
        }
    end
    return out
end
