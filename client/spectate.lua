local state = {
    isSpectating = false,
    currentPed = nil,
    currentServerId = nil,
    currentIndex = 0,
    sessionId = 0,
    scope = 'team',
    externalCandidates = nil,
}

local prevTargetKeybind
local nextTargetKeybind
local stopSpectateKeybind

---@param value string|nil
---@param fallback string
---@return string
local function normalizeKeyLabel(value, fallback)
    if not value or value == '' then
        return fallback
    end
    return tostring(value):upper()
end

---@return string, string, string
local function currentKeyLabels()
    local prevLabel = normalizeKeyLabel(prevTargetKeybind and prevTargetKeybind:getCurrentKey(), 'LEFT')
    local nextLabel = normalizeKeyLabel(nextTargetKeybind and nextTargetKeybind:getCurrentKey(), 'RIGHT')
    local stopLabel = normalizeKeyLabel(stopSpectateKeybind and stopSpectateKeybind:getCurrentKey(), 'BACK')
    return prevLabel, nextLabel, stopLabel
end

---@return number
local function countAliveTeammates()
    local _, teammates = KOSState.getMyTeam(true)
    return teammates and #teammates or 0
end

---@return nil
local function pushSpectateNui()
    if not state.isSpectating or not state.currentServerId then
        SendReactMessage('setSpectate', { visible = false })
        return
    end
    local prevLabel, nextLabel, stopLabel = currentKeyLabels()
    SendReactMessage('setSpectate', {
        visible = true,
        targetId = state.currentServerId,
        scope = state.scope,
        prevKey = prevLabel,
        nextKey = nextLabel,
        stopKey = stopLabel,
        aliveCount = state.scope == 'team' and countAliveTeammates() or nil,
    })
end

---@return nil
local function hideSpectateNui()
    SendReactMessage('setSpectate', { visible = false })
end

---@return nil
local function resetSpectateState()
    state.isSpectating = false
    state.currentPed = nil
    state.currentServerId = nil
    state.currentIndex = 0
    state.scope = 'team'
    state.externalCandidates = nil
end

---@return nil
local function stopSpectate()
    state.sessionId = state.sessionId + 1
    local lastPed = state.currentPed or cache.ped
    hideSpectateNui()
    resetSpectateState()
    if lastPed and lastPed ~= 0 then
        NetworkSetInSpectatorMode(false, lastPed)
    else
        NetworkSetInSpectatorMode(false, cache.ped)
    end
end

---@param serverId number
---@return number|nil
local function getTargetPed(serverId)
    local playerId = GetPlayerFromServerId(serverId)
    if not playerId or playerId == -1 then
        return nil
    end
    local ped = GetPlayerPed(playerId)
    if not ped or ped == 0 or not DoesEntityExist(ped) then
        return nil
    end
    return ped
end

---@return number[]
local function getSpectateCandidates()
    if state.externalCandidates and #state.externalCandidates > 0 then
        local out = {}
        for i = 1, #state.externalCandidates do
            local id = state.externalCandidates[i]
            if id and id ~= cache.serverId then
                out[#out + 1] = id
            end
        end
        return out
    end
    local myTeam, myTeamData = KOSState.getMyTeam(true)
    if not myTeam or not myTeamData or #myTeamData == 0 then
        return {}
    end
    local out = {}
    for i = 1, #myTeamData do
        local p = myTeamData[i]
        if p and p.id and p.id ~= cache.serverId then
            out[#out + 1] = p.id
        end
    end
    return out
end

---@param serverId number
---@return boolean
local function spectateServerId(serverId)
    local ped = getTargetPed(serverId)
    if not ped then
        return false
    end
    NetworkSetInSpectatorMode(true, ped)
    state.isSpectating = true
    state.currentPed = ped
    state.currentServerId = serverId
    return true
end

---@param direction number 1 = forward, -1 = backward
---@param stopOnFail boolean|nil
---@return boolean
local function spectateStep(direction, stopOnFail)
    local candidates = getSpectateCandidates()
    if #candidates == 0 then
        if stopOnFail ~= false then
            stopSpectate()
        end
        return false
    end
    local step = direction == -1 and -1 or 1
    local startIndex = 0
    if state.currentServerId then
        for i = 1, #candidates do
            if candidates[i] == state.currentServerId then
                startIndex = i
                break
            end
        end
    elseif state.currentIndex > 0 then
        startIndex = state.currentIndex
    end
    local targetIndex = startIndex + step
    if targetIndex < 1 then
        targetIndex = #candidates
    elseif targetIndex > #candidates then
        targetIndex = 1
    end
    state.currentIndex = targetIndex
    if spectateServerId(candidates[targetIndex]) then
        pushSpectateNui()
        return true
    end
    -- fallback: walk in the same direction looking for any valid target
    local probe = targetIndex
    for _ = 1, #candidates - 1 do
        probe = probe + step
        if probe < 1 then
            probe = #candidates
        elseif probe > #candidates then
            probe = 1
        end
        if probe ~= targetIndex and spectateServerId(candidates[probe]) then
            state.currentIndex = probe
            pushSpectateNui()
            return true
        end
    end
    if stopOnFail ~= false then
        stopSpectate()
    end
    return false
end

---@param sessionId number
---@return nil
local function startMonitorThread(sessionId)
    CreateThread(function()
        while state.isSpectating and state.sessionId == sessionId do
            Wait(700)
            if not state.isSpectating or state.sessionId ~= sessionId then
                break
            end
            local ped = state.currentPed
            if not ped or not DoesEntityExist(ped) or IsEntityDead(ped) then
                if not spectateStep(1, false) then
                    stopSpectate()
                    break
                end
            elseif state.scope == 'team' then
                pushSpectateNui()
            end
        end
    end)
end

---@return nil
local function startSpectate()
    if not KOSState or not KOSState.inMatch then
        return
    end
    local previousSession = state.sessionId
    local sessionId = previousSession + 1
    state.sessionId = sessionId
    state.scope = 'team'
    state.externalCandidates = nil
    if not spectateStep(1, false) then
        state.sessionId = previousSession
        resetSpectateState()
        return
    end
    startMonitorThread(sessionId)
end

---@param payload table|number
---@return nil
local function startSpectateTarget(payload)
    local targetId, scope, candidates
    if type(payload) == 'table' then
        targetId = tonumber(payload.targetId) or 0
        scope = tostring(payload.scope or 'team')
        candidates = type(payload.candidates) == 'table' and payload.candidates or nil
    else
        targetId = tonumber(payload) or 0
        scope = 'team'
        candidates = nil
    end
    targetId = math.floor(targetId)
    if targetId <= 0 then
        return
    end
    local previousSession = state.sessionId
    local sessionId = previousSession + 1
    state.sessionId = sessionId
    state.scope = scope == 'match' and 'match' or 'team'
    state.externalCandidates = candidates
    if not spectateServerId(targetId) then
        state.sessionId = previousSession
        resetSpectateState()
        return
    end
    -- remember the index of the chosen target inside the external list, if any
    if candidates then
        for i = 1, #candidates do
            if candidates[i] == targetId then
                state.currentIndex = i
                break
            end
        end
    end
    pushSpectateNui()
    startMonitorThread(sessionId)
end

local keys = (Shared and Shared.Spectate and Shared.Spectate.keys) or {}

prevTargetKeybind = lib.addKeybind({
    name = 'kos_spectate_prev_target',
    description = locale('spectate_keybind_prev'),
    defaultKey = keys.prev or 'LEFT',
    disabled = false,
    onPressed = function()
        if state.isSpectating then
            spectateStep(-1, false)
        end
    end,
})

nextTargetKeybind = lib.addKeybind({
    name = 'kos_spectate_next_target',
    description = locale('spectate_keybind_next'),
    defaultKey = keys.next or 'RIGHT',
    disabled = false,
    onPressed = function()
        if state.isSpectating then
            spectateStep(1, false)
        end
    end,
})

stopSpectateKeybind = lib.addKeybind({
    name = 'kos_spectate_stop',
    description = locale('spectate_keybind_stop'),
    defaultKey = keys.stop or 'BACK',
    disabled = false,
    onPressed = function()
        -- only outside spectators (match scope) can exit voluntarily;
        -- in-match dead players (team scope) must wait for round end / respawn
        if state.isSpectating and state.scope == 'match' then
            stopSpectate()
        end
    end,
})

RegisterNetEvent('kos:player:startSpectate', startSpectate)
RegisterNetEvent('kos:player:stopSpectate', stopSpectate)
RegisterNetEvent('kos:player:spectateTarget', startSpectateTarget)
RegisterNetEvent(Events.CLIENT_ROUND_START, stopSpectate)
RegisterNetEvent(Events.CLIENT_ROUND_END, function(payload)
    if payload and payload.nextRound ~= true then
        stopSpectate()
    end
end)
RegisterNetEvent(Events.CLIENT_MATCH_END, stopSpectate)
RegisterNetEvent(Events.CLIENT_MATCH_CLEAR, stopSpectate)

AddEventHandler('onResourceStop', function(resourceName)
    if resourceName == cache.resource then
        if state.isSpectating then
            stopSpectate()
        end
    end
end)
