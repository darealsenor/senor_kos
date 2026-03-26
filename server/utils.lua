local Utils = {}

math.randomseed(os.time())

local URL_ALPHABET = 'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict'
local DEFAULT_AVATAR = 'https://cdn.discordapp.com/embed/avatars/0.png'

---@param size number
---@return string
function Utils.generateNanoId(size)
    local id = ''
    for _ = 1, size do
        local randomIndex = math.random(64)
        id = id .. URL_ALPHABET:sub(randomIndex, randomIndex)
    end
    return id
end

---@param map table|nil
---@param teamKey string
---@return vector4|table|nil
function Utils.pickSpawn(map, teamKey)
    if not map or not map.coords then
        return nil
    end
    local list = map.coords[teamKey]
    if not list or #list == 0 then
        return nil
    end
    return list[math.random(1, #list)]
end

---@param value string|nil
---@param fallback string
---@return string
function Utils.normalizeString(value, fallback)
    if type(value) == 'string' and value ~= '' then
        return value
    end
    return fallback
end

---@param value string|nil
---@return string
function Utils.normalizeAvatar(value)
    return value or DEFAULT_AVATAR
end

---@param roundSeconds number|nil
---@return number
function Utils.roundDurationSeconds(roundSeconds)
    if type(roundSeconds) == 'number' and roundSeconds > 0 then
        return math.floor(roundSeconds)
    end
    local cfg = ServerConfig.KOS and ServerConfig.KOS.RoundDurationSeconds
    return (type(cfg) == 'number' and cfg > 0) and cfg or 600
end

---@return number
function Utils.matchCleanupSeconds()
    local cfg = ServerConfig.KOS and ServerConfig.KOS.MatchCleanupDurationSeconds
    return (type(cfg) == 'number' and cfg > 0) and cfg or 2700
end

---@param teamId string|nil
---@return string
function Utils.teamBucketKey(teamId)
    if teamId == 'teamB' then
        return 'teamB'
    end
    return 'teamA'
end

---@param raw string|number|nil
---@return string
function Utils.normalizeModeKey(raw)
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
function Utils.slotRemovePlayer(slot, playerId)
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
function Utils.collectiveRemove(collective, playerId)
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
function Utils.rosterAdd(self, teamKey, player)
    local slot = self.players[teamKey]
    local id = player.playerId
    slot.players[id] = player
    slot.playerIds[#slot.playerIds + 1] = id
    self.players.playerIds[#self.players.playerIds + 1] = id
end

return Utils