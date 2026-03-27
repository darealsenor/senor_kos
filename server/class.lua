local KOS = lib.class('KOS')
local timer = KOSTimer
local KOSPlayer = KOSPlayerClass
local storage = Storage
local utils = KOSUtils

function KOS:constructor(data)
    self.id = utils.generateNanoId(10)
    self.hostId = data.hostId

    local rs = tonumber(data and data.roundSeconds)
    self.settings = {
        mode = utils.normalizeModeKey(data and data.mode),
        amount = data.amount or 10,
        map = Maps.get(data and data.mapId or nil),
        roundSeconds = (type(rs) == 'number' and rs > 0) and math.floor(rs) or nil,
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
        nonce = 0,
    }

    self.cleanupTimerId = timer.startTimer(utils.matchCleanupSeconds(), function()
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
    local rd = utils.roundDurationSeconds(self.settings.roundSeconds)
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

    local function resolveTeamGang(teamId)
        local counts = {}
        local labels = {}
        local topCount = 0
        local dominantGang = nil
        local tie = false

        for i = 1, #rows do
            local player = rows[i]
            if player.team == teamId and player.gang and player.gang.name and player.gang.name ~= '' then
                local gangName = tostring(player.gang.name)
                local gangLabel = tostring(player.gang.label or player.gang.name)
                counts[gangName] = (counts[gangName] or 0) + 1
                labels[gangName] = gangLabel
                if counts[gangName] > topCount then
                    topCount = counts[gangName]
                    dominantGang = gangName
                    tie = false
                elseif counts[gangName] == topCount and dominantGang ~= gangName then
                    tie = true
                end
            end
        end

        if not dominantGang then
            return nil
        end

        if tie then
            return {
                name = 'mixed',
                label = 'Mixed',
            }
        end

        return {
            name = dominantGang,
            label = labels[dominantGang] or dominantGang,
        }
    end

    return {
        match = {
            id = self.id,
            hostId = self.hostId,
            state = self.state,
            startedAt = self.startedAt,
            cleanupAt = self.startedAt + utils.matchCleanupSeconds(),
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
            nonce = self.round.nonce,
        },
        teams = {
            teamA = {
                matchKills = self.players.teamA.matchKills or 0,
                players = #self.players.teamA.playerIds,
                gang = resolveTeamGang('teamA'),
            },
            teamB = {
                matchKills = self.players.teamB.matchKills or 0,
                players = #self.players.teamB.playerIds,
                gang = resolveTeamGang('teamB'),
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
    self.round.nonce = (tonumber(self.round.nonce) or 0) + 1
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
    local loserGang = nil
    local teamGangCounts = {
        teamA = {},
        teamB = {},
    }
    local gangInfoByName = {}
    local participants = {}
    local now = os.time()
    local duration = math.max(0, now - (self.startedAt or now))

    for i = 1, #self.players.playerIds do
        local playerId = self.players.playerIds[i]
        local player = self:GetPlayer(playerId)
        if player then
            local didWin = winnerTeam ~= nil and player.team == winnerTeam
            player:FinalizeMatch(didWin)
            local payload = player:ToSavePayload()
            storage.UpsertPlayerStats(payload)

            if payload.gang and payload.gang.name and payload.gang.name ~= '' and (player.team == 'teamA' or player.team == 'teamB') then
                local gangName = payload.gang.name
                teamGangCounts[player.team][gangName] = (teamGangCounts[player.team][gangName] or 0) + 1
                if not gangInfoByName[gangName] then
                    gangInfoByName[gangName] = {
                        name = gangName,
                        label = payload.gang.label,
                    }
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

    local dominantGangName = nil
    if winnerTeam == 'teamA' or winnerTeam == 'teamB' then
        local counts = teamGangCounts[winnerTeam]
        local topCount = 0
        local tie = false
        for gangName, count in pairs(counts) do
            if count > topCount then
                topCount = count
                dominantGangName = gangName
                tie = false
            elseif count == topCount then
                tie = true
            end
        end
        if tie then
            dominantGangName = nil
        end
    end

    if dominantGangName and gangInfoByName[dominantGangName] then
        winnerGang = {
            name = gangInfoByName[dominantGangName].name,
            label = gangInfoByName[dominantGangName].label,
        }
        storage.UpsertGangStats({
            gang = winnerGang,
            kills = 0,
            deaths = 0,
            matchesPlayed = 1,
            wins = 1,
            losses = 0,
        })
    end

    local loserTeam = self:GetOpposingTeam(winnerTeam)
    local losingGangName = nil
    if loserTeam == 'teamA' or loserTeam == 'teamB' then
        local counts = teamGangCounts[loserTeam]
        local topCount = 0
        local tie = false
        for gangName, count in pairs(counts) do
            if count > topCount then
                topCount = count
                losingGangName = gangName
                tie = false
            elseif count == topCount then
                tie = true
            end
        end
        if tie then
            losingGangName = nil
        end
    end

    if losingGangName and gangInfoByName[losingGangName] then
        loserGang = {
            name = gangInfoByName[losingGangName].name,
            label = gangInfoByName[losingGangName].label,
        }
    end

    storage.InsertMatchHistory({
        matchId = self.id,
        winnerTeam = winnerTeam,
        winnerGang = winnerGang,
        loserGang = loserGang,
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
    local isMatchOver = (matchWinner ~= nil) or (self.series.index >= self.series.totalRounds)

    if self.settings.mode == 'competitive' and isMatchOver then
        local all = self.players.playerIds
        if all and #all > 0 then
            lib.triggerClientEvent(Events.CLIENT_ROUND_END, all, {
                matchId = self.id,
                roundNonce = self.round.nonce,
                winnerTeam = roundWinner,
                nextRound = false,
            })
            lib.triggerClientEvent(Events.CLIENT_MATCH_END, all, {
                matchId = self.id,
                winnerTeam = matchWinner,
            })
        end
    end

    if isMatchOver then
        self:StopCleanupTimer()
        self.state = 'post_game'
        return self:PersistMatchResult(matchWinner)
    end

    if self.settings.mode == 'competitive' then
        local all = self.players.playerIds
        if all and #all > 0 then
            lib.triggerClientEvent(Events.CLIENT_ROUND_END, all, {
                matchId = self.id,
                roundNonce = self.round.nonce,
                winnerTeam = roundWinner,
                nextRound = true,
            })
        end
    end

    self.series.index = self.series.index + 1
    self:startRound()
    return true
end

---@param victimId number
---@param killerId number|nil
---@param headshot boolean|nil
---@param meters number|nil
---@param killId number|string|nil
---@return boolean
function KOS:OnPlayerKilled(victimId, killerId, headshot, meters, killId)
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
        local killEntry = {
            killer = {
                playerId = killer.playerId,
                name = utils.normalizeString(killer.name, 'Unknown'),
                image = utils.normalizeAvatar(killer.avatar),
            },
            victim = {
                playerId = victim.playerId,
                name = utils.normalizeString(victim.name, 'Unknown'),
                image = utils.normalizeAvatar(victim.avatar),
            },
            headshot = not not headshot,
            meters = tonumber(meters) or 0,
            killId = utils.generateNanoId(10),
        }
        local a = self.players.teamA.playerIds
        local b = self.players.teamB.playerIds
        if a and #a > 0 then
            lib.triggerClientEvent('kos:client:addKill', a, killEntry)
        end
        if b and #b > 0 then
            lib.triggerClientEvent('kos:client:addKill', b, killEntry)
        end

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
            else
                victim:startSpectate()
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
    elseif self.settings.mode == 'competitive' and victim.team then
        if self:IsTeamEliminated(victim.team, victimId) then
            local opposing = self:GetOpposingTeam(victim.team)
            if opposing then
                self:EndRound(opposing)
            end
        else
            victim:startSpectate()
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
            local pid = player.playerId or entry.id
            if pid then
                TriggerClientEvent(Events.CLIENT_MATCH_END, pid, { matchId = self.id, winnerTeam = self:GetWinnerTeam() })
                player:RespawnAtOldCoords(pid)
            else
                lib.print.debug(('cleanup: match %s had an empty slot (%s)'):format(self.id, tostring(entry.id)))
            end
            player:remove()
        end)
    end
    self.state = 'post_game'
end

function KOS:startRound()
    lib.print.debug('startRound')
    self:ResetRoundState()
    self.round.startedAt = os.time()
    local roundIndex = self.series.index
    self.round.timerId = timer.startTimer(utils.roundDurationSeconds(self.settings.roundSeconds), function()
        self:EndRound(self:GetLeadingTeamThisRound())
    end, self.id .. '_round_' .. roundIndex)

    local map = self.settings.map
    for _, pid in ipairs(self.players.teamA.playerIds) do
        local player = self.players.teamA.players[pid]
        if player then
            player:stopSpectate()
            player:MarkAlive()
            if self.settings.mode == 'competitive' then
                player:Respawn(utils.pickSpawn(map, 'teamA'))
                TriggerClientEvent(Events.CLIENT_ROUND_START, pid, {
                    matchId = self.id,
                    roundNonce = self.round.nonce,
                    freezeMs = ServerConfig.KOS.RespawnDelayAfterRoundBreakMs,
                })
            else
                player:RespawnAtTeamSpawn(map)
            end
        end
    end
    for _, pid in ipairs(self.players.teamB.playerIds) do
        local player = self.players.teamB.players[pid]
        if player then
            player:stopSpectate()
            player:MarkAlive()
            if self.settings.mode == 'competitive' then
                player:Respawn(utils.pickSpawn(map, 'teamB'))
                TriggerClientEvent(Events.CLIENT_ROUND_START, pid, {
                    matchId = self.id,
                    roundNonce = self.round.nonce,
                    freezeMs = ServerConfig.KOS.RespawnDelayAfterRoundBreakMs,
                })
            else
                player:RespawnAtTeamSpawn(map)
            end
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
    local key = utils.teamBucketKey(teamId)
    player.team = key
    player:CaptureOldCoords()
    player:MarkAlive()
    utils.rosterAdd(self, key, player)
    if self.state == 'in_progress' then
        self:BroadcastMatchData()
    end
    return true
end

---@return number
function KOS:GetTotalPlayerCount()
    return #self.players.playerIds
end

---@return number
function KOS:GetTeamPlayerCount(teamId)
    if teamId ~= 'teamA' and teamId ~= 'teamB' then
        return 0
    end
    return #self.players[teamId].playerIds
end

---@return nil
function KOS:HandlePlayerDeparture()
    if self.state ~= 'in_progress' then
        return
    end
    local totalPlayers = self:GetTotalPlayerCount()
    if totalPlayers <= 0 then
        self:StopRoundTimer()
        self:StopCleanupTimer()
        self.state = 'post_game'
        self:PersistMatchResult(nil)
        return
    end
    local teamACount = self:GetTeamPlayerCount('teamA')
    local teamBCount = self:GetTeamPlayerCount('teamB')
    if teamACount <= 0 and teamBCount <= 0 then
        self:EndRound(nil)
        return
    end
    if teamACount <= 0 then
        self:EndRound('teamB')
        return
    end
    if teamBCount <= 0 then
        self:EndRound('teamA')
        return
    end
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
    local key = utils.teamBucketKey(player.team)
    local slot = self.players[key]
    if slot then
        slot.matchKills = math.max(0, (slot.matchKills or 0) - killsLeaving)
    end
    player:FlushMemoryToPersistent()
    storage.UpsertPlayerStats(player:ToSavePayload())
    self:ClearClientMatch({ playerId })
    player:remove()
    utils.slotRemovePlayer(self.players[key], playerId)
    utils.collectiveRemove(self.players.playerIds, playerId)
    self:HandlePlayerDeparture()
    self:BroadcastMatchData()
    return true
end


---@param playerId number
---@return table|nil
function KOS:GetPlayer(playerId)
    return self.players.teamA.players[playerId] or self.players.teamB.players[playerId]
end

function KOS:GetPlayers()
    return self.players
end

---@param teamId string
---@return string
function KOS:NormalizeTeam(teamId)
    return utils.teamBucketKey(teamId)
end

---@param playerId number
---@param teamId string
---@return boolean
function KOS:SetPlayerTeam(playerId, teamId)
    local player = self:GetPlayer(playerId)
    if not player then
        return false
    end
    local nextTeam = self:NormalizeTeam(teamId)
    if player.team == nextTeam then
        return true
    end
    local currentTeam = self:NormalizeTeam(player.team)
    utils.slotRemovePlayer(self.players[currentTeam], playerId)
    player.team = nextTeam
    utils.slotAddPlayer(self.players[nextTeam], player)
    self:BroadcastMatchData()
    return true
end

---@return nil
function KOS:ReviveAllPlayers()
    local map = self.settings.map
    for i = 1, #self.players.playerIds do
        local pid = self.players.playerIds[i]
        local p = self:GetPlayer(pid)
        if p then
            p:stopSpectate()
            p:RespawnAtTeamSpawn(map)
        end
    end
    self:BroadcastMatchData()
end

---@return boolean
function KOS:RestartRound()
    if self.state ~= 'in_progress' then
        return false
    end
    self:StopRoundTimer()
    self:startRound()
    return true
end

---@param winsA number
---@param winsB number
---@return nil
function KOS:SetSeriesWins(winsA, winsB)
    self.series.wins.teamA = math.max(0, math.floor(tonumber(winsA) or 0))
    self.series.wins.teamB = math.max(0, math.floor(tonumber(winsB) or 0))
    self:BroadcastMatchData()
end

KOSClass = KOSClass or KOS
