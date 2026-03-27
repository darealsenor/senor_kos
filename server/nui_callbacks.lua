local storage = Storage
local matchManager = MatchManager
local avatarModule = Avatar
local canPlayerSpectate = Shared.Spectate.players == true

---@param source number
---@return boolean
local function isAdmin(source)
    return Bridge.framework.IsAdmin(source)
end

---@param ids number[]
---@return table<number, boolean>
local function uniqueSet(ids)
    local set = {}
    for i = 1, #ids do
        set[ids[i]] = true
    end
    return set
end

---@param raw any
---@return number[]
local function normalizeIdList(raw)
    local out = {}
    if type(raw) ~= 'table' then
        return out
    end
    for i = 1, #raw do
        local n = tonumber(raw[i])
        n = n and math.floor(n) or nil
        if n and n > 0 then
            out[#out + 1] = n
        end
    end
    return out
end

---@param source number
---@param data table
---@return table
local function createMatchFromMenu(source, data)
    if not isAdmin(source) then
        return { ok = false, error = 'not allowed' }
    end

    local teamAIds = normalizeIdList(data and data.teamAPlayerIds)
    local teamBIds = normalizeIdList(data and data.teamBPlayerIds)
    if #teamAIds == 0 or #teamBIds == 0 then
        return { ok = false, error = 'both teams must have players' }
    end

    local setA = uniqueSet(teamAIds)
    local setB = uniqueSet(teamBIds)
    for id, _ in pairs(setA) do
        if setB[id] then
            return { ok = false, error = ('duplicate player id %s'):format(tostring(id)) }
        end
    end

    local players = {}
    for i = 1, #teamAIds do
        players[#players + 1] = { id = teamAIds[i], team = 'teamA' }
    end
    for i = 1, #teamBIds do
        players[#players + 1] = { id = teamBIds[i], team = 'teamB' }
    end

    local modeKey = data and data.modeKey or 'time_limit'
    local amount = tonumber(data and (data.killsToWinRound or data.amount)) or 10
    amount = math.floor(amount)
    if amount < 1 then
        amount = 1
    end

    local rounds = tonumber(data and (data.seriesLength or data.rounds)) or 3
    rounds = math.floor(rounds)
    if rounds < 1 then
        rounds = 1
    end

    local roundSeconds = tonumber(data and data.roundSeconds) or nil
    if roundSeconds then
        roundSeconds = math.floor(roundSeconds)
        if roundSeconds < 1 then
            roundSeconds = nil
        end
    end

    local mapId = data and data.mapId or nil
    if mapId == '' then
        mapId = nil
    end

    local matchId = matchManager.CreateMatch({
        hostId = source,
        mode = modeKey,
        amount = amount,
        rounds = rounds,
        roundSeconds = roundSeconds,
        mapId = mapId,
        players = players,
        teams = {
            teamA = { players = {} },
            teamB = { players = {} },
        },
    })

    if not matchId then
        return { ok = false, error = 'could not create match' }
    end

    return { ok = true, matchId = matchId }
end

---@param match table
---@return table
local function summarizeActiveMatch(match)
    local data = match:GetMatchData()
    if not data then
        return {}
    end
    local players = data.players or {}
    local outPlayers = {}
    for i = 1, #players do
        local p = players[i]
        outPlayers[#outPlayers + 1] = {
            id = p.id,
            name = p.name,
            avatar = p.avatar,
            team = p.team,
            alive = p.alive == true,
            kills = p.kills or 0,
            deaths = p.deaths or 0,
        }
    end
    return {
        id = data.match and data.match.id or '',
        state = data.match and data.match.state or 'unknown',
        mode = data.mode and data.mode.key or 'unknown',
        mapName = data.map and data.map.name or nil,
        roundIndex = data.series and data.series.index or 1,
        roundTotal = data.series and data.series.total or 1,
        score = {
            teamA = data.series and data.series.wins and data.series.wins.teamA or 0,
            teamB = data.series and data.series.wins and data.series.wins.teamB or 0,
        },
        players = outPlayers,
    }
end

---@param source number
---@param match table
---@return nil
local function spectateTargetForSource(source, match)
    if source <= 0 or not match then
        return
    end
    local players = match:GetMatchData().players or {}
    for i = 1, #players do
        local p = players[i]
        if p and p.alive == true then
            TriggerClientEvent('kos:player:spectateTarget', source, p.id)
            return
        end
    end
end

---@param source number
---@param message string
---@return nil
local function txAdminAnnounce(source, message)
    TriggerEvent('txsv:announce', message)
    TriggerEvent('txAdmin:events:announcement', {
        message = message,
        author = source > 0 and ('Player ' .. tostring(source)) or 'server',
    })
end

lib.callback.register('kos:server:getLeaderboards', function(source, data)
    if source <= 0 then
        return { players = {}, gangs = {} }
    end
    local limit = data and tonumber(data.limit) or 25
    return {
        players = storage.LoadTopPlayers(limit),
        gangs = storage.LoadTopGangs(limit),
    }
end)

lib.callback.register('kos:server:getLeaderboardPlayers', function(source, data)
    local limit = data and tonumber(data.limit) or 10
    local offset = data and tonumber(data.offset) or 0
    local query = data and data.query or ''
    query = tostring(query or '')
    return {
        rows = storage.LoadLeaderboardPlayers(limit, offset, query),
        total = storage.CountLeaderboardPlayers(query),
    }
end)

lib.callback.register('kos:server:getLeaderboardGangs', function(source, data)
    local limit = data and tonumber(data.limit) or 10
    local offset = data and tonumber(data.offset) or 0
    local query = data and data.query or ''
    query = tostring(query or '')
    return {
        rows = storage.LoadLeaderboardGangs(limit, offset, query),
        total = storage.CountLeaderboardGangs(query),
    }
end)

lib.callback.register('kos:server:getMatchHistory', function(source, data)
    if source <= 0 then
        return { rows = {}, nextOffset = 0, total = 0 }
    end
    local limit = data and tonumber(data.limit) or 25
    local offset = data and tonumber(data.offset) or 0
    local okRows, rows = pcall(storage.LoadMatchHistory, limit, offset)
    if not okRows or type(rows) ~= 'table' then
        lib.print.warn(('getMatchHistory failed: %s'):format(tostring(rows)))
        return { rows = {}, nextOffset = math.floor(tonumber(offset) or 0), total = 0 }
    end

    local okTotal, total = pcall(storage.CountMatchHistory)
    if not okTotal then
        lib.print.warn(('CountMatchHistory failed: %s'):format(tostring(total)))
        total = 0
    end

    local nextOffset = (math.floor(tonumber(offset) or 0) + #rows)
    return { rows = rows, nextOffset = nextOffset, total = total }
end)

lib.callback.register('kos:server:getMatchHistoryDetail', function(source, data)
    if source <= 0 then
        return nil
    end
    local id = data and tonumber(data.id) or 0
    local ok, result = pcall(storage.LoadMatchHistoryDetail, id)
    if not ok then
        lib.print.warn(('getMatchHistoryDetail failed for %s: %s'):format(tostring(id), tostring(result)))
        return nil
    end
    return result
end)

lib.callback.register('kos:server:createMatchFromMenu', function(source, data)
    return createMatchFromMenu(source, data or {})
end)

lib.callback.register('kos:server:getOnlinePlayers', function(source, data)
    local online = GetPlayers()
    local out = {}
    for i = 1, #online do
        local sid = tonumber(online[i])
        if sid and sid > 0 then
            if matchManager.IsPlayerInMatch(sid) then
                goto continue
            end
            local name = GetPlayerName(sid) or ('Player ' .. tostring(sid))
            local avatar = avatarModule.Get(sid)
            if not avatar then
                local identifier = Bridge.framework.GetPlayerIdentifier(sid)
                if identifier and identifier ~= '' then
                    local row = storage.LoadPlayerStats(identifier)
                    avatar = row and row.avatar or nil
                end
            end
            out[#out + 1] = { id = sid, name = tostring(name), avatar = avatar }
        end
        ::continue::
    end
    return { players = out }
end)

lib.callback.register('kos:server:getActiveMatches', function(source, data)
    local matches = matchManager.ListMatches()
    local rows = {}
    for _, entry in pairs(matches) do
        local matchData = entry and entry.matchData
        if matchData and matchData.match and matchData.match.id then
            local live = matchManager.GetMatchById(matchData.match.id)
            if live then
                rows[#rows + 1] = summarizeActiveMatch(live)
            end
        end
    end
    table.sort(rows, function(a, b)
        return tostring(a.id or '') < tostring(b.id or '')
    end)
    return {
        matches = rows,
        canPlayerSpectate = canPlayerSpectate,
        isAdmin = isAdmin(source),
    }
end)

lib.callback.register('kos:server:activeMatchAction', function(source, data)
    local action = data and tostring(data.action or '') or ''
    local matchId = data and tostring(data.matchId or '') or ''

    local canSpectate = canPlayerSpectate
    local admin = isAdmin(source)
    if action == 'stop_spectate' then
        if not admin and not canSpectate then
            return { ok = false, error = 'not allowed' }
        end
        TriggerClientEvent('kos:player:stopSpectate', source)
        return { ok = true }
    end

    local match = matchManager.GetMatchById(matchId)
    if not match then
        return { ok = false, error = 'match not found' }
    end

    if action == 'spectate' then
        if not admin and not canSpectate then
            return { ok = false, error = 'not allowed' }
        end
        local targetId = tonumber(data and data.targetPlayerId) or 0
        targetId = math.floor(targetId)
        if targetId > 0 then
            TriggerClientEvent('kos:player:spectateTarget', source, targetId)
            return { ok = true }
        end
        spectateTargetForSource(source, match)
        return { ok = true }
    end

    if not admin then
        return { ok = false, error = 'not allowed' }
    end

    if action == 'cancel' then
        return { ok = matchManager.StopMatch(matchId) }
    end

    if action == 'send_message' then
        local text = tostring(data and data.message or '')
        if text == '' then
            return { ok = false, error = 'message required' }
        end
        local ids = match:GetPlayers().playerIds
        lib.triggerClientEvent('txcl:showAnnouncement', ids, { message = text, author = 'KOS' })
        return { ok = true }
    end

    if action == 'announce' then
        local text = tostring(data and data.message or '')
        if text == '' then
            return { ok = false, error = 'announcement required' }
        end
        txAdminAnnounce(source, text)
        return { ok = true }
    end

    if action == 'restart_round' then
        return { ok = match:RestartRound() }
    end

    if action == 'revive_all' then
        match:ReviveAllPlayers()
        return { ok = true }
    end

    if action == 'change_score' then
        local winsA = tonumber(data and data.winsA) or 0
        local winsB = tonumber(data and data.winsB) or 0
        match:SetSeriesWins(winsA, winsB)
        return { ok = true }
    end

    if action == 'change_team' then
        local playerId = tonumber(data and data.playerId) or 0
        playerId = math.floor(playerId)
        local team = tostring(data and data.team or '')
        if playerId <= 0 then
            return { ok = false, error = 'playerId required' }
        end
        if team ~= 'teamA' and team ~= 'teamB' then
            return { ok = false, error = 'team must be teamA or teamB' }
        end
        return { ok = match:SetPlayerTeam(playerId, team) }
    end

    if action == 'remove_player' then
        local playerId = tonumber(data and data.playerId) or 0
        playerId = math.floor(playerId)
        if playerId <= 0 then
            return { ok = false, error = 'playerId required' }
        end
        local ok = match:RemovePlayer(playerId)
        if not ok then
            return { ok = false, error = 'failed to remove player' }
        end
        local players = match:GetPlayers()
        local teamACount = #(players.teamA and players.teamA.playerIds or {})
        local teamBCount = #(players.teamB and players.teamB.playerIds or {})
        if teamACount == 0 or teamBCount == 0 then
            matchManager.StopMatch(matchId)
        end
        return { ok = true }
    end

    if action == 'add_player' then
        local playerId = tonumber(data and data.playerId) or 0
        playerId = math.floor(playerId)
        local team = tostring(data and data.team or '')
        if playerId <= 0 then
            return { ok = false, error = 'playerId required' }
        end
        if team ~= 'teamA' and team ~= 'teamB' then
            return { ok = false, error = 'team must be teamA or teamB' }
        end
        return { ok = match:AddPlayer(playerId, team) }
    end

    return { ok = false, error = 'unknown action' }
end)
