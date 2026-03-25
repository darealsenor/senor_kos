local KOS = require 'server.class'

local matchesById = {}
local playerToMatch = {}

local function mapPlayersToMatch(match)
    local roster = match:GetPlayers()
    local ids = roster and roster.playerIds
    if not ids then
        return
    end
    for i = 1, #ids do
        playerToMatch[ids[i]] = match.id
    end
end

---@param matchId string
local function clearPlayersForMatch(matchId)
    for playerId, linkedMatchId in pairs(playerToMatch) do
        if linkedMatchId == matchId then
            playerToMatch[playerId] = nil
        end
    end
end

---@param data table
---@return string|nil
local function createMatch(data)
    if not data or type(data) ~= 'table' then
        return nil
    end
    local match = KOS:new(data or {})
    matchesById[match.id] = match

    if data and data.players then
        for _, entry in ipairs(data.players) do
            if entry and entry.id then
                match:AddPlayer(entry.id, entry.team)
            end
        end
    end

    mapPlayersToMatch(match)
    match:Start()
    lib.print.debug(('match %s started - %d players, %s, target %s, %d rounds'):format(
        match.id,
        #(data.players or {}),
        match.settings and match.settings.mode or '?',
        tostring(match.settings and match.settings.amount),
        match.series and match.series.totalRounds or 0
    ))
    return match.id
end

---@param matchId string
---@return boolean
local function stopMatch(matchId)
    local match = matchesById[matchId]
    if not match then
        return false
    end
    match:remove()
    matchesById[matchId] = nil
    clearPlayersForMatch(matchId)
    lib.print.debug(('match %s stopped'):format(matchId))
    return true
end

local function getMatchByPlayer(sourceId)
    local matchId = playerToMatch[sourceId]
    if not matchId then
        return nil
    end
    return matchesById[matchId]
end

AddEventHandler('kos:server:matchExpired', function(matchId)
    if not matchId or matchesById[matchId] == nil then
        return
    end
    stopMatch(matchId)
end)

RegisterNetEvent('kos:playerDied', function(data)
    local victimId = source
    local match = getMatchByPlayer(victimId)
    if not match then
        return
    end
    local killerServerId = data and data.killerServerId or nil
    local headshot = data and data.headshot or false
    lib.print.debug(('%s died in %s (killer %s, hs: %s)'):format(
        tostring(victimId),
        match.id,
        killerServerId and tostring(killerServerId) or '?',
        headshot and 'yes' or 'no'
    ))
    match:OnPlayerKilled(victimId, killerServerId, headshot)
end)

RegisterNetEvent('kos:server:createMatch', function(data)
    local sourceId = source
    local matchId = createMatch(data)
    lib.print.debug(('createMatch: %s -> %s'):format(tostring(sourceId), tostring(matchId)))
    if matchId then
        lib.triggerClientEvent(Events.CLIENT_MATCH_CREATED, sourceId, matchId)
    end
end)

AddEventHandler('playerDropped', function()
    local playerId = source
    local match = getMatchByPlayer(playerId)
    if not match then
        return
    end
    lib.print.debug(('player %s disconnected during %s'):format(tostring(playerId), match.id))
    match:RemovePlayer(playerId)
    playerToMatch[playerId] = nil
end)

---@return table<string, table>
local function listMatches()
    local output = {}
    for matchId, match in pairs(matchesById) do
        output[matchId] = {
            id = matchId,
            matchData = match:GetMatchData(),
            players = match:GetPlayers(),
        }
    end
    return output
end

---@param matchId string
---@return table|nil
local function getMatchData(matchId)
    local match = matchesById[matchId]
    if not match then
        return nil
    end
    return match:GetMatchData()
end

exports('CreateMatch', createMatch)
exports('StopMatch', stopMatch)
exports('ListMatches', listMatches)
exports('GetMatchData', getMatchData)
exports('GetMatchScoreboard', getMatchData)
exports('GetMatchForPlayer', getMatchByPlayer)

return {
    CreateMatch = createMatch,
    StopMatch = stopMatch,
    ListMatches = listMatches,
    GetMatchData = getMatchData,
    GetMatchScoreboard = getMatchData,
    GetMatchForPlayer = getMatchByPlayer,
}
