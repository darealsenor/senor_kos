local KOSPlayer = lib.class('KOSPlayer')
local storage = require 'server.storage'
local utils = require 'server.utils'
local Avatar = require 'server.avatar'

local respawnAfterTeleportMs = math.max(0, tonumber(ServerConfig.KOS.RespawnDelayAfterTeleportMs) or 2000)

---@param playerId number
---@return string|nil
local function getLicenseIdentifier(playerId)
    local identifiers = GetPlayerIdentifiers(playerId)
    for i = 1, #identifiers do
        local identifier = identifiers[i]
        if identifier:sub(1, 8) == 'license:' then
            return identifier
        end
    end
    return nil
end

---@param playerId number
function KOSPlayer:constructor(playerId)
    self.playerId = playerId
    self.identifier = Bridge.framework.GetPlayerIdentifier(playerId) or getLicenseIdentifier(playerId)
    self.name = Bridge.framework.GetPlayerName(playerId)
    self.avatar = nil
    self.team = nil
    self.oldCoords = nil
    self.alive = true
    self.gang = Bridge.gangs.GetPlayerGang(playerId)
    self.memory = {
        kills = 0,
        deaths = 0,
        headshots = 0,
        playtime = 0,
        matchesPlayed = 0,
        wins = 0,
        losses = 0,
    }
    self.persistent = {
        kills = 0,
        deaths = 0,
        headshots = 0,
        playtime = 0,
        matchesPlayed = 0,
        wins = 0,
        losses = 0,
    }
    self.persistant = self.persistent
    self:LoadPersistent()
    CreateThread(function()
        Wait(1500)
        local resolvedAvatar = Avatar.Get(playerId)
        if resolvedAvatar and resolvedAvatar ~= '' and resolvedAvatar ~= self.avatar then
            self.avatar = resolvedAvatar
            storage.UpsertPlayerStats(self:ToSavePayload())
        end
    end)
    self.spectating = false
end

---@return nil
function KOSPlayer:CaptureOldCoords()
    local playerId = self.playerId
    if not playerId then
        return
    end
    local ped = GetPlayerPed(playerId)
    if not ped or ped == 0 then
        return
    end
    local coords = GetEntityCoords(ped)
    local heading = GetEntityHeading(ped)
    self.oldCoords = {
        x = coords.x,
        y = coords.y,
        z = coords.z,
        w = heading,
    }
end

---@param playerId number|nil
---@return nil
function KOSPlayer:RespawnAtOldCoords(playerId)
    CreateThread(function()
        Wait(2000)
        self:Respawn(self.oldCoords, playerId or self.playerId)
    end)
end

---@param kind string|nil
function KOSPlayer:get(kind)
    if not kind then
        return self
    end
    if kind == 'memory' then
        return self.memory
    elseif kind == 'persistent' or kind == 'persistant' then
        return self.persistent
    end
end

---@param kind string
---@param data table
function KOSPlayer:set(kind, data)
    if not kind or type(data) ~= 'table' then
        return false
    end
    if kind == 'memory' then
        for k, v in pairs(data) do
            self.memory[k] = v
        end
    elseif kind == 'persistent' or kind == 'persistant' then
        for k, v in pairs(data) do
            self.persistent[k] = v
        end
    end
    return true
end

---@param field string
---@param amount number|nil
---@return number
function KOSPlayer:AddMemoryStat(field, amount)
    local value = tonumber(amount) or 1
    self.memory[field] = (self.memory[field] or 0) + value
    return self.memory[field]
end

---@return table|nil
function KOSPlayer:LoadPersistent()
    if not self.identifier then
        return nil
    end
    local row = storage.LoadPlayerStats(self.identifier)
    if not row then
        return nil
    end
    self.name = row.name or self.name
    self.avatar = row.avatar or self.avatar
    self.gang = row.gang or self.gang
    self.persistent.kills = row.kills or 0
    self.persistent.deaths = row.deaths or 0
    self.persistent.headshots = row.headshots or 0
    self.persistent.playtime = row.playtime or 0
    self.persistent.matchesPlayed = row.matchesPlayed or 0
    self.persistent.wins = row.wins or 0
    self.persistent.losses = row.losses or 0
    return row
end

---@return table
function KOSPlayer:FlushMemoryToPersistent()
    for key, value in pairs(self.memory) do
        self.persistent[key] = (self.persistent[key] or 0) + value
        self.memory[key] = 0
    end
    return self.persistent
end

---@return table
function KOSPlayer:ToSavePayload()
    return {
        identifier = self.identifier,
        name = self.name,
        avatar = self.avatar,
        gang = self.gang and {
            name = self.gang.name,
            label = self.gang.label,
        } or nil,
        kills = self.persistent.kills or 0,
        deaths = self.persistent.deaths or 0,
        headshots = self.persistent.headshots or 0,
        playtime = self.persistent.playtime or 0,
        matchesPlayed = self.persistent.matchesPlayed or 0,
        wins = self.persistent.wins or 0,
        losses = self.persistent.losses or 0,
    }
end

---@param didWin boolean
function KOSPlayer:FinalizeMatch(didWin)
    self:AddMemoryStat('matchesPlayed', 1)
    if didWin then
        self:AddMemoryStat('wins', 1)
    else
        self:AddMemoryStat('losses', 1)
    end
    self:FlushMemoryToPersistent()
end

---@param playerId number|nil
---@return nil
function KOSPlayer:Revive(playerId)
    local id = playerId or self.playerId
    if not id then
        lib.print.debug('revive: no player id, ignoring')
        return
    end
    Bridge.hospital.Revive(id)
end

---@return nil
function KOSPlayer:MarkAlive()
    self.alive = true
end

---@return nil
function KOSPlayer:MarkDead()
    self.alive = false
end

---@return boolean
function KOSPlayer:IsAlive()
    return self.alive == true
end

---@return table
function KOSPlayer:MatchDataPlayer()
    local mem = self:get('memory') or {}
    return {
        id = self.playerId,
        name = self.name,
        avatar = self.avatar,
        team = self.team == 'teamB' and 'teamB' or 'teamA',
        gang = self.gang and {
            name = self.gang.name,
            label = self.gang.label,
        } or nil,
        alive = self:IsAlive(),
        kills = mem.kills or 0,
        deaths = mem.deaths or 0,
        headshots = mem.headshots or 0,
    }
end

---@param map table|nil
---@return nil
function KOSPlayer:RespawnAtTeamSpawn(map)
    self:Respawn(utils.pickSpawn(map, (self.team and self.team ~= '') and self.team or 'teamA'))
end

---@param vec vector4|table|nil
---@param playerId number|nil
---@return nil
function KOSPlayer:Respawn(vec, playerId)
    local id = playerId or self.playerId
    if not id then
        lib.print.debug('respawn: no player id, ignoring')
        return
    end
    CreateThread(function()
        self:MarkAlive()
        self:Teleport(vec, id)
        if respawnAfterTeleportMs > 0 then
            Wait(respawnAfterTeleportMs)
        end
        self:Revive(id)
    end)
end

---@param vec vector4|table|nil
---@param playerId number|nil
---@return nil
function KOSPlayer:Teleport(vec, playerId)
    local id = playerId or self.playerId
    if not id then
        lib.print.debug('tp: no player id, ignoring')
        return
    end
    if not vec then
        lib.print.debug(('tp: no coords (player %s)'):format(tostring(id)))
        return
    end
    local ped = GetPlayerPed(id)
    if not ped or ped == 0 then
        lib.print.debug(('tp: no ped for player %s'):format(tostring(id)))
        return
    end
    SetEntityCoords(ped, vec.x, vec.y, vec.z, false, false, false, false)
    SetEntityHeading(ped, vec.w)
    lib.print.debug(('tp player %s -> %.1f, %.1f, %.1f  h %.0f'):format(
        tostring(id), vec.x, vec.y, vec.z, vec.w))
end

---@param map table|nil
---@return nil
function KOSPlayer:TeleportToMapSpawn(map)
    if not map or not map.coords then
        lib.print.debug(('spawn tp: no map data (player %s)'):format(tostring(self.playerId)))
        return
    end
    local key = (self.team and self.team ~= '') and self.team or 'teamA'
    local list = map.coords[key]
    if not list or #list == 0 then
        lib.print.debug(('spawn tp: map %s has no spawns for %s (player %s)'):format(
            tostring(map.id), key, tostring(self.playerId)))
        return
    end
    self:Teleport(list[math.random(1, #list)])
end

function KOSPlayer:remove()
    self.playerId = nil
    if self.spectating then
        self:stopSpectate()
    end
end

function KOSPlayer:startSpectate()
    self.spectating = true
    TriggerClientEvent('kos:player:startSpectate', self.playerId)
end

function KOSPlayer:stopSpectate()
    self.spectating = false
    TriggerClientEvent('kos:player:stopSpectate', self.playerId)
end

return KOSPlayer
