local storage = {}

---@param gangKey any
---@param gangName any
---@return table|nil
local function buildGang(gangKey, gangName)
    if not gangKey or tostring(gangKey) == '' then
        return nil
    end
    local key = tostring(gangKey)
    local label = (gangName and tostring(gangName)) or key
    if Shared.IsGangBlacklisted(key, label) then
        return nil
    end
    return {
        name = key,
        label = label,
    }
end

---@param identifier string
---@return table|nil
function storage.LoadPlayerStats(identifier)
    if not identifier or identifier == '' then
        return nil
    end

    local result = MySQL.single.await('SELECT * FROM kos_players WHERE identifier = ?', { identifier })
    if not result then
        return nil
    end

    return {
        identifier = tostring(result.identifier),
        name = result.name and tostring(result.name) or nil,
        avatar = result.avatar and tostring(result.avatar) or nil,
        gang = buildGang(result.gang_key, result.gang_name),
        kills = tonumber(result.kills) or 0,
        deaths = tonumber(result.deaths) or 0,
        headshots = tonumber(result.headshots) or 0,
        playtime = tonumber(result.playtime) or 0,
        matchesPlayed = tonumber(result.matches_played) or 0,
        wins = tonumber(result.wins) or 0,
        losses = tonumber(result.losses) or 0,
    }
end

---@param payload table
---@return boolean
function storage.UpsertPlayerStats(payload)
    if not payload or not payload.identifier or payload.identifier == '' then
        return false
    end

    MySQL.insert.await([[
        INSERT INTO kos_players (
            identifier, name, avatar, gang_key, gang_name, kills, deaths, headshots, playtime, matches_played, wins, losses
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            avatar = VALUES(avatar),
            gang_key = VALUES(gang_key),
            gang_name = VALUES(gang_name),
            kills = VALUES(kills),
            deaths = VALUES(deaths),
            headshots = VALUES(headshots),
            playtime = VALUES(playtime),
            matches_played = VALUES(matches_played),
            wins = VALUES(wins),
            losses = VALUES(losses),
            updated_at = CURRENT_TIMESTAMP
    ]], {
        payload.identifier,
        payload.name,
        payload.avatar,
        payload.gang and payload.gang.name or nil,
        payload.gang and payload.gang.label or nil,
        payload.kills or 0,
        payload.deaths or 0,
        payload.headshots or 0,
        payload.playtime or 0,
        payload.matchesPlayed or 0,
        payload.wins or 0,
        payload.losses or 0,
    })

    return true
end

---@param payload table
---@return boolean
function storage.UpsertGangStats(payload)
    local gangName = payload and payload.gang and payload.gang.name or nil
    if not gangName or gangName == '' then
        return false
    end
    local gangLabel = payload.gang and payload.gang.label or gangName
    if Shared.IsGangBlacklisted(gangName, gangLabel) then
        return false
    end

    MySQL.insert.await([[
        INSERT INTO kos_gangs (
            gang_key, gang_name, kills, deaths, matches_played, wins, losses
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            gang_name = VALUES(gang_name),
            kills = kills + VALUES(kills),
            deaths = deaths + VALUES(deaths),
            matches_played = matches_played + VALUES(matches_played),
            wins = wins + VALUES(wins),
            losses = losses + VALUES(losses),
            updated_at = CURRENT_TIMESTAMP
    ]], {
        gangName,
        gangLabel,
        payload.kills or 0,
        payload.deaths or 0,
        payload.matchesPlayed or 0,
        payload.wins or 0,
        payload.losses or 0,
    })

    return true
end

---@param payload table
---@return boolean
function storage.InsertMatchHistory(payload)
    if not payload or not payload.matchId or payload.matchId == '' then
        return false
    end

    MySQL.insert.await([[
        INSERT INTO kos_history (
            match_id, winner_team, winner_gang_key, winner_gang_name, duration, participants_json
        ) VALUES (?, ?, ?, ?, ?, ?)
    ]], {
        payload.matchId,
        payload.winnerTeam,
        payload.winnerGang and payload.winnerGang.name or nil,
        payload.winnerGang and payload.winnerGang.label or nil,
        payload.duration or 0,
        json.encode(payload.participants or {}),
    })

    return true
end

---@param limit number|nil
---@return table[]
function storage.LoadTopPlayers(limit)
    local n = math.floor(tonumber(limit) or 25)
    if n < 1 then
        n = 1
    elseif n > 100 then
        n = 100
    end

    local rows = MySQL.query.await([[
        SELECT identifier, name, avatar, gang_key, gang_name, kills, deaths, headshots, matches_played, wins, losses
        FROM kos_players
        ORDER BY wins DESC, kills DESC
        LIMIT ?
    ]], { n }) or {}

    local out = {}
    for i = 1, #rows do
        local r = rows[i]
        out[#out + 1] = {
            identifier = tostring(r.identifier),
            name = r.name and tostring(r.name) or nil,
            avatar = r.avatar and tostring(r.avatar) or nil,
            gang = buildGang(r.gang_key, r.gang_name),
            kills = tonumber(r.kills) or 0,
            deaths = tonumber(r.deaths) or 0,
            headshots = tonumber(r.headshots) or 0,
            matchesPlayed = tonumber(r.matches_played) or 0,
            wins = tonumber(r.wins) or 0,
            losses = tonumber(r.losses) or 0,
        }
    end
    return out
end

---@param limit number|nil
---@return table[]
function storage.LoadTopGangs(limit)
    local n = math.floor(tonumber(limit) or 25)
    if n < 1 then
        n = 1
    elseif n > 100 then
        n = 100
    end

    local rows = MySQL.query.await([[
        SELECT gang_key, gang_name, kills, deaths, matches_played, wins, losses
        FROM kos_gangs
        ORDER BY wins DESC, kills DESC
        LIMIT ?
    ]], { n }) or {}

    local out = {}
    for i = 1, #rows do
        local r = rows[i]
        local gangKey = tostring(r.gang_key)
        local gangLabel = r.gang_name and tostring(r.gang_name) or gangKey
        if not Shared.IsGangBlacklisted(gangKey, gangLabel) then
            out[#out + 1] = {
                gangKey = gangKey,
                gangName = gangLabel,
                kills = tonumber(r.kills) or 0,
                deaths = tonumber(r.deaths) or 0,
                matchesPlayed = tonumber(r.matches_played) or 0,
                wins = tonumber(r.wins) or 0,
                losses = tonumber(r.losses) or 0,
            }
        end
    end
    return out
end

---@param limit number|nil
---@param offset number|nil
---@param query string|nil
---@return table[]
function storage.LoadLeaderboardPlayers(limit, offset, query)
    local n = math.floor(tonumber(limit) or 25)
    if n < 1 then
        n = 1
    elseif n > 100 then
        n = 100
    end

    local off = math.floor(tonumber(offset) or 0)
    if off < 0 then
        off = 0
    end

    local whereSql = ''
    local whereParams = {}
    local q = query and tostring(query) or ''
    q = q:gsub('%%', ''):sub(1, 64)
    if q ~= '' then
        local like = ('%%' .. q .. '%%')
        whereSql = 'WHERE identifier LIKE ? OR name LIKE ? OR gang_name LIKE ?'
        whereParams = { like, like, like }
    end

    local sql = [[
        SELECT identifier, name, avatar, gang_key, gang_name, kills, deaths, headshots, matches_played, wins, losses
        FROM kos_players
    ]] .. whereSql .. [[
        ORDER BY wins DESC, kills DESC
        LIMIT ? OFFSET ?
    ]]

    local params = {}
    for i = 1, #whereParams do
        params[#params + 1] = whereParams[i]
    end
    params[#params + 1] = n
    params[#params + 1] = off

    local rows = MySQL.query.await(sql, params) or {}
    local out = {}
    for i = 1, #rows do
        local r = rows[i]
        out[#out + 1] = {
            identifier = tostring(r.identifier),
            name = r.name and tostring(r.name) or nil,
            avatar = r.avatar and tostring(r.avatar) or nil,
            gang = buildGang(r.gang_key, r.gang_name),
            kills = tonumber(r.kills) or 0,
            deaths = tonumber(r.deaths) or 0,
            headshots = tonumber(r.headshots) or 0,
            matchesPlayed = tonumber(r.matches_played) or 0,
            wins = tonumber(r.wins) or 0,
            losses = tonumber(r.losses) or 0,
        }
    end
    return out
end

---@param query string|nil
---@return number
function storage.CountLeaderboardPlayers(query)
    local whereSql = ''
    local whereParams = {}
    local q = query and tostring(query) or ''
    q = q:gsub('%%', ''):sub(1, 64)
    if q ~= '' then
        local like = ('%%' .. q .. '%%')
        whereSql = 'WHERE identifier LIKE ? OR name LIKE ? OR gang_name LIKE ?'
        whereParams = { like, like, like }
    end

    local sql = [[
        SELECT COUNT(*) as cnt
        FROM kos_players
    ]] .. whereSql

    local row = MySQL.single.await(sql, whereParams)
    return tonumber(row and row.cnt) or 0
end

---@param limit number|nil
---@param offset number|nil
---@param query string|nil
---@return table[]
function storage.LoadLeaderboardGangs(limit, offset, query)
    local n = math.floor(tonumber(limit) or 25)
    if n < 1 then
        n = 1
    elseif n > 100 then
        n = 100
    end

    local off = math.floor(tonumber(offset) or 0)
    if off < 0 then
        off = 0
    end

    local whereSql = ''
    local whereParams = {}
    local q = query and tostring(query) or ''
    q = q:gsub('%%', ''):sub(1, 64)
    if q ~= '' then
        local like = ('%%' .. q .. '%%')
        whereSql = 'WHERE gang_key LIKE ? OR gang_name LIKE ?'
        whereParams = { like, like }
    end

    local sql = [[
        SELECT gang_key, gang_name, kills, deaths, matches_played, wins, losses
        FROM kos_gangs
    ]] .. whereSql .. [[
        ORDER BY wins DESC, kills DESC
        LIMIT ? OFFSET ?
    ]]

    local params = {}
    for i = 1, #whereParams do
        params[#params + 1] = whereParams[i]
    end
    params[#params + 1] = n
    params[#params + 1] = off

    local rows = MySQL.query.await(sql, params) or {}
    local out = {}
    for i = 1, #rows do
        local r = rows[i]
        local gangKey = tostring(r.gang_key)
        local gangLabel = r.gang_name and tostring(r.gang_name) or gangKey
        if not Shared.IsGangBlacklisted(gangKey, gangLabel) then
            out[#out + 1] = {
                gangKey = gangKey,
                gangName = gangLabel,
                kills = tonumber(r.kills) or 0,
                deaths = tonumber(r.deaths) or 0,
                matchesPlayed = tonumber(r.matches_played) or 0,
                wins = tonumber(r.wins) or 0,
                losses = tonumber(r.losses) or 0,
            }
        end
    end
    return out
end

---@param query string|nil
---@return number
function storage.CountLeaderboardGangs(query)
    local whereSql = ''
    local whereParams = {}
    local q = query and tostring(query) or ''
    q = q:gsub('%%', ''):sub(1, 64)
    if q ~= '' then
        local like = ('%%' .. q .. '%%')
        whereSql = 'WHERE gang_key LIKE ? OR gang_name LIKE ?'
        whereParams = { like, like }
    end

    local sql = [[
        SELECT COUNT(*) as cnt
        FROM kos_gangs
    ]] .. whereSql

    local row = MySQL.single.await(sql, whereParams)
    return tonumber(row and row.cnt) or 0
end

---@param limit number|nil
---@param offset number|nil
---@return table[]
function storage.LoadMatchHistory(limit, offset)
    local n = math.floor(tonumber(limit) or 25)
    if n < 1 then
        n = 1
    elseif n > 100 then
        n = 100
    end
    local off = math.floor(tonumber(offset) or 0)
    if off < 0 then
        off = 0
    end

    local rows = MySQL.query.await([[
        SELECT id, match_id, winner_team, winner_gang_key, winner_gang_name, duration, ended_at
        FROM kos_history
        ORDER BY ended_at DESC
        LIMIT ? OFFSET ?
    ]], { n, off }) or {}

    local out = {}
    for i = 1, #rows do
        local r = rows[i]
        out[#out + 1] = {
            id = tonumber(r.id) or 0,
            matchId = tostring(r.match_id),
            winnerTeam = r.winner_team and tostring(r.winner_team) or nil,
            winnerGang = buildGang(r.winner_gang_key, r.winner_gang_name),
            duration = tonumber(r.duration) or 0,
            endedAt = r.ended_at and tostring(r.ended_at) or '',
        }
    end
    return out
end

---@return number
function storage.CountMatchHistory()
    local row = MySQL.single.await('SELECT COUNT(*) as cnt FROM kos_history')
    return tonumber(row and row.cnt) or 0
end

---@param id number
---@return table|nil
function storage.LoadMatchHistoryDetail(id)
    local hid = math.floor(tonumber(id) or 0)
    if hid <= 0 then
        return nil
    end

    local r = MySQL.single.await([[
        SELECT id, match_id, winner_team, winner_gang_key, winner_gang_name, duration, ended_at, participants_json
        FROM kos_history
        WHERE id = ?
        LIMIT 1
    ]], { hid })

    if not r then
        return nil
    end

    local participants = {}
    if r.participants_json and tostring(r.participants_json) ~= '' then
        local ok, decoded = pcall(json.decode, r.participants_json)
        if ok and type(decoded) == 'table' then
            participants = decoded
        end
    end

    return {
        id = tonumber(r.id) or hid,
        matchId = tostring(r.match_id),
        winnerTeam = r.winner_team and tostring(r.winner_team) or nil,
        winnerGang = buildGang(r.winner_gang_key, r.winner_gang_name),
        duration = tonumber(r.duration) or 0,
        endedAt = r.ended_at and tostring(r.ended_at) or '',
        participants = participants,
    }
end

return storage
