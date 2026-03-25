local matchManager = require 'server.match_manager'

---@param sourceId number
---@param message string
---@param notifType string|nil
local function notify(sourceId, message, notifType)
    if sourceId <= 0 then
        return
    end
    Bridge.notifications.Notify(sourceId, message, notifType)
end

---@return table
local function buildDebugPlayers()
    local online = GetPlayers()
    local players = {}
    local teamIndex = 1
    local teams = { 'teamA', 'teamB' }
    for i = 1, #online do
        local id = tonumber(online[i])
        if id then
            players[#players + 1] = {
                id = id,
                team = teams[teamIndex],
            }
            teamIndex = (teamIndex % 2) + 1
        end
    end
    return players
end

lib.addCommand('kos:debug_create', {
    help = 'Spin up a test match with whoever is online',
    params = {
        { name = 'mode', type = 'number', help = '0 kill cap / 1 time / 2 competitive, or strings kill_limit time_limit competitive', optional = true },
        { name = 'amount', type = 'number', help = 'Kill target (mode 0 only)', optional = true },
        { name = 'rounds', type = 'number', help = 'How many rounds', optional = true },
        { name = 'map', type = 'string', help = 'Map id from maps.lua', optional = true },
    },
    restricted = 'group.admin',
}, function(source, args)
    local players = buildDebugPlayers()
    if #players < 2 then
        notify(source, 'Need two people online for this', 'error')
        return
    end
    local mode = tonumber(args.mode) or 0
    local amount = tonumber(args.amount) or 5
    local rounds = tonumber(args.rounds) or 3
    local mapId = args.map
    if mapId == '' then
        mapId = nil
    end
    local matchId = matchManager.CreateMatch({
        hostId = source > 0 and source or players[1].id,
        mode = mode,
        amount = amount,
        rounds = rounds,
        mapId = mapId,
        players = players,
        teams = {
            teamA = { players = {} },
            teamB = { players = {} },
        },
    })
    if not matchId then
        notify(source, 'Could not start match', 'error')
        return
    end
    lib.print.debug(('kos debug: created %s (%d players, host src %s)'):format(matchId, #players, tostring(source)))
    notify(source, ('Match %s, %d players'):format(matchId, #players), 'success')
end)

lib.addCommand('kos:debug_stop', {
    help = 'Tear down a match by id',
    params = {
        { name = 'matchId', type = 'string', help = 'The id you got from debug_create' },
    },
    restricted = 'group.admin',
}, function(source, args)
    local matchId = args.matchId
    if not matchId or matchId == '' then
        notify(source, 'Pass the match id', 'error')
        return
    end
    local ok = matchManager.StopMatch(matchId)
    if not ok then
        notify(source, ('Nothing running with id %s'):format(matchId), 'error')
        return
    end
    lib.print.debug(('kos debug: stopped %s (src %s)'):format(matchId, tostring(source)))
    notify(source, ('Stopped %s'):format(matchId), 'success')
end)

lib.addCommand('kos:debug_list', {
    help = 'Show running matches',
    params = {},
    restricted = 'group.admin',
}, function(source)
    local matches = matchManager.ListMatches()
    local count = 0
    for matchId, match in pairs(matches) do
        count = count + 1
        local roster = match.players
        local playerCount = roster and roster.playerIds and #roster.playerIds or 0
        local md = match.matchData
        local series = md and md.series
        local m = md and md.match
        local cur = series and series.index or 0
        local total = series and series.total or 0
        lib.print.debug(('%s - state %s, round %s/%s, %d players'):format(
            tostring(matchId),
            tostring(m and m.state),
            tostring(cur),
            tostring(total),
            playerCount
        ))
    end
    local msg = count == 1 and '1 match running' or ('%d matches running'):format(count)
    notify(source, msg, 'inform')
end)

lib.addCommand('kos:admin', {
    help = 'Open the KOS admin NUI',
    params = {},
    restricted = 'group.admin',
}, function(source)
    if source <= 0 then
        return
    end
    TriggerClientEvent(Events.CLIENT_OPEN_ADMIN, source, {})
end)
