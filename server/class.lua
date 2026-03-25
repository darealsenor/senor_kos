local KOS = lib.class('KOS')
local timer = require 'server.timer'
local KOSPlayer = require 'server.player'
local storage = require 'server.storage'

---@return number
local function roundDurationSeconds()
    local cfg = ServerConfig.KOS and ServerConfig.KOS.RoundDurationSeconds
    return (type(cfg) == 'number' and cfg > 0) and cfg or 600
end

---@return number
local function matchCleanupSeconds()
    local cfg = ServerConfig.KOS and ServerConfig.KOS.MatchCleanupDurationSeconds
    return (type(cfg) == 'number' and cfg > 0) and cfg or 2700
end

---@param teamId string|nil
---@return string
local function teamBucketKey(teamId)
    if teamId == 'teamB' then
        return 'teamB'
    end
    return 'teamA'
end

---@param raw string|number|nil
---@return string
local function normalizeModeKey(raw)
    if raw == nil then
        return 'time_limit'
    end
    if type(raw) == 'string' then
        if raw == 'kill_limit' or raw == 'time_limit' or raw == 'competitive' then
            return raw
        end
        lib.print.debug(('game mode %s is not a thing, using time_limit'):format(tostring(raw)))
        return 'time_limit'
    end
    local n = tonumber(raw)
    if n == 0 then
        return 'kill_limit'
    end
    if n == 1 then
        return 'time_limit'
    end
    if n == 2 then
        return 'competitive'
    end
    lib.print.debug(('game mode %s is not a thing, using time_limit'):format(tostring(raw)))
    return 'time_limit'
end

---@param slot table
---@param playerId number
---@return nil
local function slotRemovePlayer(slot, playerId)
    for i = #slot.playerIds, 1, -1 do
        if slot.playerIds[i] == playerId then
            table.remove(slot.playerIds, i)
            break
        end
    end
    slot.players[playerId] = nil
end

---@param collective number[]
---@param playerId number
---@return nil
local function collectiveRemove(collective, playerId)
    for i = #collective, 1, -1 do
        if collective[i] == playerId then
            table.remove(collective, i)
            break
        end
    end
end

---@param self table
---@param teamKey string
---@param player table
---@return nil
local function rosterAdd(self, teamKey, player)
    local slot = self.players[teamKey]
    local id = player.playerId
    slot.players[id] = player
    slot.playerIds[#slot.playerIds + 1] = id
    self.players.playerIds[#self.players.playerIds + 1] = id
end

function KOS:constructor(data)
    self.id = GenerateNanoID(10)
    self.hostId = data.hostId

    self.settings = {
        mode = normalizeModeKey(data and data.mode),
        amount = data.amount or 10,
        map = Maps.get(data and data.mapId or nil),
    }

    self.players = {
        teamA = { players = {}, playerIds = {}, matchKills = 0 },
        teamB = { players = {}, playerIds = {}, matchKills = 0 },
        playerIds = {},
    }

    self.state = 'pre_game'
    self.startedAt = os.time()

    self.series = {
        totalRounds = data.rounds or 1,
        index = 1,
        wins = {
            teamA = 0,
            teamB = 0,
        },
        lastRoundWinner = nil,
    }

    self.round = {
        startedAt = nil,
        timerId = nil,
        teamKills = {
            teamA = 0,
            teamB = 0,
        },
        winner = nil,
    }

    self.cleanupTimerId = timer.startTimer(matchCleanupSeconds(), function()
        self:OnMatchCleanupExpired()
    end, self.id .. '_match_cleanup')
end

---@return nil
function KOS:BroadcastMatchData()
    local data = self:GetMatchData()
    local a = self.players.teamA.playerIds
    local b = self.players.teamB.playerIds
    if #a > 0 then
        lib.triggerClientEvent(Events.CLIENT_MATCH_DATA_SYNC, a, data)
    end
    if #b > 0 then
        lib.triggerClientEvent(Events.CLIENT_MATCH_DATA_SYNC, b, data)
    end
end

---@param playerIds number[]
---@return nil
function KOS:ClearClientMatch(playerIds)
    if not playerIds or #playerIds == 0 then
        return
    end
    lib.triggerClientEvent(Events.CLIENT_MATCH_CLEAR, playerIds, {})
end

---@return nil
function KOS:StopCleanupTimer()
    if self.cleanupTimerId then
        timer.stopTimer(self.cleanupTimerId)
        self.cleanupTimerId = nil
    end
end

---@return nil
function KOS:StopRoundTimer()
    if self.round and self.round.timerId then
        timer.stopTimer(self.round.timerId)
        self.round.timerId = nil
    end
end

---@return nil
function KOS:OnMatchCleanupExpired()
    if self.state == 'post_game' then
        return
    end
    self:StopRoundTimer()
    self:StopCleanupTimer()
    self.state = 'post_game'
    self:PersistMatchResult(self:GetWinnerTeam())
end

---@return table
function KOS:GetMatchData()
    local rd = roundDurationSeconds()
    local endsAt = nil
    local remaining = nil
    if self.state == 'in_progress' and self.round.startedAt then
        endsAt = self.round.startedAt + rd
        remaining = math.max(0, endsAt - os.time())
    end
    local now = os.time()
    local map = self.settings.map
    local rows = {}
    for _, pid in ipairs(self.players.teamA.playerIds) do
        local p = self.players.teamA.players[pid]
        if p then
            rows[#rows + 1] = p:MatchDataPlayer()
        end
    end
    for _, pid in ipairs(self.players.teamB.playerIds) do
        local p = self.players.teamB.players[pid]
        if p then
            rows[#rows + 1] = p:MatchDataPlayer()
        end
    end
    table.sort(rows, function(a, b)
        if a.team ~= b.team then
            return a.team == 'teamA'
        end
        return (a.name or '') < (b.name or '')
    end)
    return {
        match = {
            id = self.id,
            hostId = self.hostId,
            state = self.state,
            startedAt = self.startedAt,
            cleanupAt = self.startedAt + matchCleanupSeconds(),
            serverTime = now,
        },
        map = map and {
            id = map.id,
            name = map.name,
        } or nil,
        mode = {
            key = self.settings.mode,
            killsToWinRound = (self.settings.mode == 'kill_limit') and self.settings.amount or nil,
            roundSeconds = rd,
            seriesLength = self.series.totalRounds,
        },
        series = {
            index = self.series.index,
            total = self.series.totalRounds,
            wins = {
                teamA = self.series.wins.teamA,
                teamB = self.series.wins.teamB,
            },
            lastWinner = self.series.lastRoundWinner,
        },
        round = {
            startedAt = self.round.startedAt,
            endsAt = endsAt,
            remainingSeconds = remaining,
            durationSeconds = rd,
            kills = {
                teamA = self.round.teamKills.teamA,
                teamB = self.round.teamKills.teamB,
            },
            winner = self.round.winner,
        },
        teams = {
            teamA = {
                matchKills = self.players.teamA.matchKills or 0,
                players = #self.players.teamA.playerIds,
            },
            teamB = {
                matchKills = self.players.teamB.matchKills or 0,
                players = #self.players.teamB.playerIds,
            },
        },
        players = rows,
    }
end

---@return string|nil
function KOS:GetWinnerTeam()
    local a = self.players.teamA.matchKills or 0
    local b = self.players.teamB.matchKills or 0
    if a > b then
        return 'teamA'
    end
    if b > a then
        return 'teamB'
    end
    return nil
end

---@return nil
function KOS:ResetRoundState()
    self.round.teamKills = {
        teamA = 0,
        teamB = 0,
    }
    self.round.winner = nil
end

---@param teamId string|nil
---@return number
function KOS:GetRoundKills(teamId)
    if not teamId then
        return 0
    end
    return self.round.teamKills[teamId] or 0
end

---@return string|nil
function KOS:GetLeadingTeamThisRound()
    local a = self.round.teamKills.teamA or 0
    local b = self.round.teamKills.teamB or 0
    if a > b then
        return 'teamA'
    end
    if b > a then
        return 'teamB'
    end
    return nil
end

---@param teamId string|nil
---@return string|nil
function KOS:GetOpposingTeam(teamId)
    if teamId == 'teamA' then
        return 'teamB'
    end
    if teamId == 'teamB' then
        return 'teamA'
    end
    return nil
end

---@param teamId string|nil
---@param victimId number
---@return boolean
function KOS:IsTeamEliminated(teamId, victimId)
    if teamId ~= 'teamA' and teamId ~= 'teamB' then
        return false
    end
    local slot = self.players[teamId]
    local found = false
    for _, pid in ipairs(slot.playerIds) do
        local p = slot.players[pid]
        if p then
            found = true
            if pid ~= victimId and p:IsAlive() then
                return false
            end
        end
    end
    return found
end

---@param roundWinner string|nil
---@return nil
function KOS:RecordRoundResult(roundWinner)
    self.round.winner = roundWinner
    self.series.lastRoundWinner = roundWinner
    if roundWinner then
        self.series.wins[roundWinner] = (self.series.wins[roundWinner] or 0) + 1
    end
end

---@return string|nil
function KOS:ResolveMatchWinner()
    local aWins = self.series.wins.teamA or 0
    local bWins = self.series.wins.teamB or 0
    if self.series.index >= self.series.totalRounds then
        if aWins > bWins then
            return 'teamA'
        end
        if bWins > aWins then
            return 'teamB'
        end
        local aKills = self.players.teamA.matchKills or 0
        local bKills = self.players.teamB.matchKills or 0
        if aKills > bKills then
            return 'teamA'
        end
        if bKills > aKills then
            return 'teamB'
        end
        return nil
    end
    return nil
end

---@param matchWinnerTeam string|nil
---@return boolean
function KOS:PersistMatchResult(matchWinnerTeam)
    local winnerTeam = matchWinnerTeam or self:GetWinnerTeam()
    local winnerGang = nil
    local gangAgg = {}
    local participants = {}
    local now = os.time()
    local duration = math.max(0, now - (self.startedAt or now))

    for i = 1, #self.players.playerIds do
        local playerId = self.players.playerIds[i]
        local player = self:GetPlayer(playerId)
        if player then
            local matchStats = player:get('memory') or {}
            local didWin = winnerTeam ~= nil and player.team == winnerTeam
            player:FinalizeMatch(didWin)
            local payload = player:ToSavePayload()
            storage.UpsertPlayerStats(payload)

            if payload.gang and payload.gang.name and payload.gang.name ~= '' then
                if not gangAgg[payload.gang.name] then
                    gangAgg[payload.gang.name] = {
                        gang = {
                            name = payload.gang.name,
                            label = payload.gang.label,
                        },
                        kills = 0,
                        deaths = 0,
                        matchesPlayed = 0,
                        wins = 0,
                        losses = 0,
                    }
                end
                gangAgg[payload.gang.name].kills = gangAgg[payload.gang.name].kills + (matchStats.kills or 0)
                gangAgg[payload.gang.name].deaths = gangAgg[payload.gang.name].deaths + (matchStats.deaths or 0)
                gangAgg[payload.gang.name].matchesPlayed = gangAgg[payload.gang.name].matchesPlayed + 1
                if didWin then
                    gangAgg[payload.gang.name].wins = gangAgg[payload.gang.name].wins + 1
                    winnerGang = winnerGang or {
                        name = payload.gang.name,
                        label = payload.gang.label,
                    }
                else
                    gangAgg[payload.gang.name].losses = gangAgg[payload.gang.name].losses + 1
                end
            end

            participants[#participants + 1] = {
                source = playerId,
                identifier = payload.identifier,
                name = payload.name,
                team = player.team,
                gang = payload.gang,
                stats = payload,
            }
        end
    end

    for _, gangPayload in pairs(gangAgg) do
        storage.UpsertGangStats(gangPayload)
    end

    storage.InsertMatchHistory({
        matchId = self.id,
        winnerTeam = winnerTeam,
        winnerGang = winnerGang,
        duration = duration,
        participants = participants,
    })

    self:BroadcastMatchData()
    TriggerEvent('kos:server:matchExpired', self.id)
    return true
end

---@param roundWinner string|nil
---@return boolean
function KOS:EndRound(roundWinner)
    if self.state ~= 'in_progress' then
        return false
    end
    self:StopRoundTimer()
    self:RecordRoundResult(roundWinner)
    local matchWinner = self:ResolveMatchWinner()
    if matchWinner or self.series.index >= self.series.totalRounds then
        self:StopCleanupTimer()
        self.state = 'post_game'
        return self:PersistMatchResult(matchWinner)
    end
    self.series.index = self.series.index + 1
    self:startRound()
    return true
end

---@param victimId number
---@param killerId number|nil
---@param headshot boolean|nil
---@return boolean
function KOS:OnPlayerKilled(victimId, killerId, headshot)
    if self.state ~= 'in_progress' then
        return false
    end
    local victim = self:GetPlayer(victimId)
    if not victim then
        return false
    end
    if not victim:IsAlive() then
        return true
    end
    victim:MarkDead()
    victim:AddMemoryStat('deaths', 1)
    local killer = killerId and self:GetPlayer(killerId) or nil
    local enemyKill = killer
        and killer.playerId ~= victimId
        and killer.team
        and victim.team
        and killer.team ~= victim.team
    local map = self.settings.map

    if enemyKill and killer then
        killer:AddMemoryStat('kills', 1)
        if headshot then
            killer:AddMemoryStat('headshots', 1)
        end
        local killerTeam = killer.team
        self.round.teamKills[killerTeam] = (self.round.teamKills[killerTeam] or 0) + 1
        local slot = self.players[killerTeam]
        if slot then
            slot.matchKills = (slot.matchKills or 0) + 1
        end
        if self.settings.mode == 'competitive' then
            if self:IsTeamEliminated(victim.team, victimId) then
                self:EndRound(killerTeam)
            end
        elseif self.settings.mode == 'kill_limit' then
            if self:GetRoundKills(killerTeam) >= self.settings.amount then
                self:EndRound(killerTeam)
            else
                victim:RespawnAtTeamSpawn(map)
            end
        elseif self.settings.mode == 'time_limit' then
            victim:RespawnAtTeamSpawn(map)
        end
        self:BroadcastMatchData()
        return true
    end

    if self.settings.mode == 'kill_limit' or self.settings.mode == 'time_limit' then
        victim:RespawnAtTeamSpawn(map)
    elseif self.settings.mode == 'competitive' and victim.team and self:IsTeamEliminated(victim.team, victimId) then
        local opposing = self:GetOpposingTeam(victim.team)
        if opposing then
            self:EndRound(opposing)
        end
    end
    self:BroadcastMatchData()
    return true
end

---@return boolean
function KOS:Start()
    if self.state ~= 'pre_game' then
        return false
    end
    self.state = 'in_progress'
    self:startRound()
    return true
end

---@return nil
function KOS:remove()
    self:StopRoundTimer()
    self:StopCleanupTimer()
    local snapshot = {}
    for i = 1, #self.players.playerIds do
        local pid = self.players.playerIds[i]
        local p = self:GetPlayer(pid)
        snapshot[#snapshot + 1] = { id = pid, player = p }
    end
    local clearIds = {}
    for i = 1, #self.players.playerIds do
        clearIds[i] = self.players.playerIds[i]
    end
    self:ClearClientMatch(clearIds)
    self.players.teamA.players = {}
    self.players.teamA.playerIds = {}
    self.players.teamA.matchKills = 0
    self.players.teamB.players = {}
    self.players.teamB.playerIds = {}
    self.players.teamB.matchKills = 0
    self.players.playerIds = {}
    lib.print.debug(('match %s over, kicking %d players back to life'):format(self.id, #snapshot))
    for i = 1, #snapshot do
        local entry = snapshot[i]
        CreateThread(function()
            local player = entry.player
            if not player then
                lib.print.debug(('cleanup: match %s had an empty slot (%s)'):format(self.id, tostring(entry.id)))
                return
            end
            local pid = player.playerId
            if pid then
                Bridge.hospital.Revive(pid)
            else
                lib.print.debug(('cleanup: match %s had an empty slot (%s)'):format(self.id, tostring(entry.id)))
            end
            player:remove()
        end)
    end
    self.state = 'post_game'
end

function KOS:startRound()
    self:ResetRoundState()
    self.round.startedAt = os.time()
    local roundIndex = self.series.index
    self.round.timerId = timer.startTimer(roundDurationSeconds(), function()
        self:EndRound(self:GetLeadingTeamThisRound())
    end, self.id .. '_round_' .. roundIndex)
    local afterBreakMs = 0
    if self.series.index > 1 then
        local cfg = ServerConfig.KOS and ServerConfig.KOS.RespawnDelayAfterRoundBreakMs
        afterBreakMs = (type(cfg) == 'number' and cfg >= 0) and cfg or 650
    end
    local map = self.settings.map
    for _, pid in ipairs(self.players.teamA.playerIds) do
        local player = self.players.teamA.players[pid]
        if player then
            player:MarkAlive()
            player:RespawnAtTeamSpawn(map, afterBreakMs)
        end
    end
    for _, pid in ipairs(self.players.teamB.playerIds) do
        local player = self.players.teamB.players[pid]
        if player then
            player:MarkAlive()
            player:RespawnAtTeamSpawn(map, afterBreakMs)
        end
    end
    self:BroadcastMatchData()
end

---@param playerId number
---@param teamId string|nil
---@return boolean
function KOS:AddPlayer(playerId, teamId)
    if self:GetPlayer(playerId) then
        return false
    end
    local player = KOSPlayer:new(playerId)
    local key = teamBucketKey(teamId)
    player.team = key
    player:MarkAlive()
    rosterAdd(self, key, player)
    if self.state == 'in_progress' then
        self:BroadcastMatchData()
    end
    return true
end

---@param playerId number
---@return boolean
function KOS:RemovePlayer(playerId)
    local player = self:GetPlayer(playerId)
    if not player then
        return false
    end
    local mem = player:get('memory') or {}
    local killsLeaving = mem.kills or 0
    local key = teamBucketKey(player.team)
    local slot = self.players[key]
    if slot then
        slot.matchKills = math.max(0, (slot.matchKills or 0) - killsLeaving)
    end
    player:FlushMemoryToPersistent()
    storage.UpsertPlayerStats(player:ToSavePayload())
    self:ClearClientMatch({ playerId })
    player:remove()
    slotRemovePlayer(self.players[key], playerId)
    collectiveRemove(self.players.playerIds, playerId)
    self:BroadcastMatchData()
    return true
end

function KOS:GetPlayers()
    return self.players
end

---@param playerId number
---@return table|nil
function KOS:GetPlayer(playerId)
    return self.players.teamA.players[playerId] or self.players.teamB.players[playerId]
end

---@param teamId string|nil
---@return table|nil
function KOS:GetTeam(teamId)
    if teamId ~= 'teamA' and teamId ~= 'teamB' then
        return nil
    end
    return self.players[teamId]
end

return KOS
