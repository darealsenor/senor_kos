Redzone = lib.class('Redzone')


local EXPECTED_NAME = 'senor_redzones'
if GetCurrentResourceName() ~= EXPECTED_NAME then
    for _ = 1, 100 do
        print(('^1[%s] ^2WARNING: ^1Resource name should be ^3%s^1, not ^3%s'):format(EXPECTED_NAME, EXPECTED_NAME, GetCurrentResourceName()))
        print(('^1[%s] ^2WARNING: ^1SCRIPT WILL NOT WORK UNTIL YOU FIX THIS ISSUE'):format(EXPECTED_NAME))
        Wait(3000)
    end
end

---@param data table
function Redzone:constructor(data)
    assert(data, 'Redzone requires data')
    assert(data.type == 'permanent' or data.type == 'temporary', 'Redzone type must be permanent or temporary')

    self.id = data.id
    self.name = data.name
    self.type = data.type
    self.coords = type(data.coords) == 'vector3' and data.coords or vec3(data.coords.x, data.coords.y, data.coords.z)
    self.radius = data.radius
    self.bucket = data.bucket or 0
    self.durationType = data.durationType
    self.duration = (data.durationType and data.duration) and tonumber(data.duration) or 0
    self.loadout = data.loadout or {}
    self.killstreaks = data.killstreaks or {}
    self.blipName = data.blipName
    self.blipColour = data.blipColour or 1
    self.markerColour = data.markerColour or { 255, 42, 24, 120 }
    self.enabled = data.type == 'permanent' and (data.enabled == nil or data.enabled == true)
    self.spawnPoints = data.spawnPoints or {}
    self.autoRevive = data.autoRevive ~= false

    self.runtime = {
        active = true,
        players = {},
        formerPlayers = {},
        processedDeaths = {},
        startTime = os.time(),
        totalKills = 0
    }
end

---@return table
function Redzone:get()
    return {
        id = self.id,
        name = self.name,
        type = self.type,
        coords = { x = self.coords.x, y = self.coords.y, z = self.coords.z },
        radius = self.radius,
        bucket = self.bucket,
        durationType = self.durationType,
        duration = self.duration,
        loadout = self.loadout,
        killstreaks = self.killstreaks,
        blipName = self.blipName,
        blipColour = self.blipColour,
        markerColour = self.markerColour,
        enabled = self.enabled,
        spawnPoints = self.spawnPoints,
        autoRevive = self.autoRevive,
        active = self.runtime.active,
        startTime = self.runtime.startTime
    }
end

---@param source number
function Redzone:addPlayer(source)
    local former = self.runtime.formerPlayers and self.runtime.formerPlayers[source]
    if former then
        self.runtime.players[source] = former
        self.runtime.formerPlayers[source] = nil
    else
        self.runtime.players[source] = {
            kills = 0,
            deaths = 0,
            streak = 0
        }
    end
end

---@param source number
function Redzone:removePlayer(source)
    local stats = self.runtime.players[source]
    if stats and type(stats) == 'table' then
        if not self.runtime.formerPlayers then self.runtime.formerPlayers = {} end
        self.runtime.formerPlayers[source] = {
            kills = stats.kills,
            deaths = stats.deaths,
            streak = stats.streak,
        }
    end
    self.runtime.players[source] = nil
    if self.runtime.processedDeaths then
        self.runtime.processedDeaths[source] = nil
    end
end

---@param victim number
function Redzone:onPlayerDeath(victim)
    local stats = self.runtime.players[victim]
    if not stats then return end
    stats.deaths = stats.deaths + 1
    stats.streak = 0
end

---@param killer number
---@param victim number
function Redzone:onKill(killer, victim)
    assert(self.runtime.players[killer], 'Killer must be in zone')
    assert(self.runtime.players[victim], 'Victim must be in zone')

    local killerStats = self.runtime.players[killer]
    local victimStats = self.runtime.players[victim]

    victimStats.deaths = victimStats.deaths + 1
    victimStats.streak = 0

    if killer ~= victim then
        killerStats.kills = killerStats.kills + 1
        killerStats.streak = killerStats.streak + 1
        self.runtime.totalKills = self.runtime.totalKills + 1
        self:handleKillstreak(killer)
    end
end

---@param source number
function Redzone:handleKillstreak(source)
    local stats = self.runtime.players[source]
    if not stats then return end

    local reward = self.killstreaks[tostring(stats.streak)] or self.killstreaks[stats.streak]
    if not reward then return end

    if reward.type == 'item' and reward.name then
        local meta = type(reward.metadata) == 'table' and table.clone(reward.metadata) or {}
        meta.redzone = true
        Bridge.inventory.AddItem(source, reward.name, reward.amount, meta)
    elseif reward.type == 'money' and reward.amount then
        Bridge.framework.AddMoney(source, reward.amount, reward.account)
    end
end

---@return boolean
function Redzone:checkExpired()
    if not self.durationType or self.duration <= 0 then return false end

    if self.durationType == 'time' then
        return (os.time() - self.runtime.startTime) >= self.duration
    end

    if self.durationType == 'kills' then
        return self.runtime.totalKills >= self.duration
    end

    return false
end

---@return number
function Redzone:getTimeRemaining()
    if not self.durationType or self.durationType ~= 'time' or self.duration <= 0 then return 0 end
    local elapsed = os.time() - self.runtime.startTime
    return math.max(0, self.duration - elapsed)
end

---@param currentPlayerId? number
---@return table
function Redzone:getLeaderboard(currentPlayerId)
    local players = {}
    for playerId, stats in pairs(self.runtime.players) do
        players[#players + 1] = {
            playerId = playerId,
            name = Bridge.framework.GetPlayerName(playerId),
            kills = stats.kills,
            deaths = stats.deaths,
            streak = stats.streak,
        }
    end
    table.sort(players, function(a, b) return a.kills > b.kills end)
    local payload = {
        zoneId = self.id,
        players = players,
        totalKills = self.runtime.totalKills,
        durationType = self.durationType,
        duration = self.duration,
        currentPlayerId = currentPlayerId,
    }
    if self.durationType == 'time' and self.duration and self.duration > 0 then
        payload.endTime = self.runtime.startTime + self.duration
    end
    return payload
end

---@return table
function Redzone:getEndResults()
    local lb = self:getLeaderboard()
    local topPlayers = {}
    for i = 1, math.min(10, #lb.players) do
        topPlayers[i] = lb.players[i]
    end
    local duration = self.durationType == 'time' and (os.time() - self.runtime.startTime) or 0
    return {
        zoneId = self.id,
        zoneName = self.name,
        topPlayers = topPlayers,
        totalKills = self.runtime.totalKills,
        duration = duration,
    }
end
