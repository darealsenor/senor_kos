local state = {
    isSpectating = false,
    currentPed = nil,
    currentServerId = nil,
    currentIndex = 0,
    sessionId = 0,
}

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

---@return string
local function getSpectateUiText()
    local nextLabel = normalizeKeyLabel(nextTargetKeybind and nextTargetKeybind:getCurrentKey(), 'E')
    local stopLabel = normalizeKeyLabel(stopSpectateKeybind and stopSpectateKeybind:getCurrentKey(), 'BACK')
    return ('[%s] - Next Teammate\n[%s] - Stop Spectating'):format(nextLabel, stopLabel)
end

---@return nil
local function showSpectateTextUi()
    lib.showTextUI(getSpectateUiText(), { position = 'bottom-center' })
end

---@return nil
local function hideSpectateTextUi()
    local isOpen = lib.isTextUIOpen()
    if isOpen then
        lib.hideTextUI()
    end
end

---@return nil
local function resetSpectateState()
    state.isSpectating = false
    state.currentPed = nil
    state.currentServerId = nil
    state.currentIndex = 0
end

---@return nil
local function stopSpectate()
    state.sessionId = state.sessionId + 1
    local lastPed = state.currentPed or cache.ped
    hideSpectateTextUi()
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

---@param stopOnFail boolean|nil
---@return boolean
local function spectateNextTarget(stopOnFail)
    local candidates = getSpectateCandidates()
    if #candidates == 0 then
        if stopOnFail ~= false then
            stopSpectate()
        end
        return false
    end
    local nextIndex = 1
    if state.currentServerId then
        for i = 1, #candidates do
            if candidates[i] == state.currentServerId then
                nextIndex = i + 1
                break
            end
        end
    elseif state.currentIndex > 0 then
        nextIndex = state.currentIndex + 1
    end
    if nextIndex > #candidates then
        nextIndex = 1
    end
    state.currentIndex = nextIndex
    if spectateServerId(candidates[nextIndex]) then
        return true
    end
    for i = 1, #candidates do
        if i ~= nextIndex and spectateServerId(candidates[i]) then
            state.currentIndex = i
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
                if not spectateNextTarget(false) then
                    stopSpectate()
                    break
                end
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
    if not spectateNextTarget(false) then
        state.sessionId = previousSession
        resetSpectateState()
        return
    end
    showSpectateTextUi()
    startMonitorThread(sessionId)
end

---@param targetServerId number
---@return nil
local function startSpectateTarget(targetServerId)
    if not targetServerId or targetServerId <= 0 then
        return
    end
    local previousSession = state.sessionId
    local sessionId = previousSession + 1
    state.sessionId = sessionId
    if not spectateServerId(targetServerId) then
        state.sessionId = previousSession
        resetSpectateState()
        return
    end
    showSpectateTextUi()
    startMonitorThread(sessionId)
end

nextTargetKeybind = lib.addKeybind({
    name = 'kos_spectate_next_target',
    description = 'Spectate next teammate',
    defaultKey = 'E',
    disabled = false,
    onPressed = function()
        if state.isSpectating then
            spectateNextTarget(false)
            showSpectateTextUi()
        end
    end,
})

stopSpectateKeybind = lib.addKeybind({
    name = 'kos_spectate_stop',
    description = 'Stop spectating',
    defaultKey = 'BACK',
    disabled = false,
    onPressed = function()
        if state.isSpectating then
            stopSpectate()
        end
    end,
})

-- RegisterCommand('spectate', function()
--     if state.isSpectating then
--         stopSpectate()
--         return
--     end
--     startSpectate()
-- end, false)

RegisterNetEvent('kos:player:startSpectate', startSpectate)
RegisterNetEvent('kos:player:stopSpectate', stopSpectate)
RegisterNetEvent('kos:player:spectateTarget', function(targetServerId)
    startSpectateTarget(tonumber(targetServerId) or 0)
end)
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