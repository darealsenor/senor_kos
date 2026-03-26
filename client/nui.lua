local adminOpen = false

---@return table<string, string>
local function getLocaleData()
    local path = ('locales.%s'):format(lib.getLocaleKey() or 'en')
    local locales = lib.loadJson(path)
    return locales
end

---@return nil
local function sendLocaleData()
    SendReactMessage('setLocale', getLocaleData())
end

--- Shows or hides the NUI document and clears focus when the admin panel is closed.
---@return nil
local function applyFrameVisibility()
    local snap = KOSState.getSnapshot()
    local show = snap.inMatch or adminOpen
    SendReactMessage('setVisible', show)
    if not adminOpen then
        SetNuiFocus(false, false)
    end
end

--- Sends the current match payload and this client's server id to React.
---@return nil
local function pushMatchToNui()
    local snap = KOSState.getSnapshot()
    SendReactMessage('matchData', {
        match = snap.matchData,
        localPlayerId = GetPlayerServerId(PlayerId()),
    })
end

local scoreboardKeybind = lib.addKeybind({
    name = 'kos_scoreboard',
    description = locale('scoreboard_toggle'),
    defaultKey = Config.ScoreboardKey,
    disabled = true,
    onPressed = function()
        if KOSState.inMatch and not IsNuiFocused() then
            SendReactMessage('scoreboardToggle', {})
        end
    end,
})

AddEventHandler(Events.CLIENT_STATE_UPDATED, function()
    if scoreboardKeybind then
        scoreboardKeybind:disable(not KOSState.inMatch)
    end
    pushMatchToNui()
    applyFrameVisibility()
end)

RegisterNetEvent(Events.CLIENT_OPEN_ADMIN, function(payload)
    adminOpen = true
    SendReactMessage('setVisible', true)
    sendLocaleData()
    local isAdmin = payload and payload.isAdmin == true
    local maps = Maps.listForUi()
    SendReactMessage('openMenu', { isAdmin = isAdmin, maps = maps })
    SetNuiFocus(true, true)
end)

RegisterNUICallback('hideFrame', function(_, cb)
    local wasAdmin = adminOpen
    adminOpen = false
    applyFrameVisibility()
    if wasAdmin then
        SendReactMessage('menuClosed', {})
    end
    cb({})
end)

RegisterNUICallback('kos:getUiConfig', function(_, cb)
    cb(Config.UI)
end)

RegisterNUICallback('kos:getUiLocale', function(_, cb)
    cb(getLocaleData())
end)

---@param data table
---@return number
local function normalizeLimit(data)
    local n = data and tonumber(data.limit) or 25
    n = math.floor(n)
    if n < 1 then
        return 1
    end
    if n > 100 then
        return 100
    end
    return n
end

---@param data table
---@return number
local function normalizeOffset(data)
    local n = data and tonumber(data.offset) or 0
    n = math.floor(n)
    if n < 0 then
        return 0
    end
    return n
end

RegisterNUICallback('kosMenu:getLeaderboards', function(data, cb)
    local limit = normalizeLimit(data)
    local resp = lib.callback.await('kos:server:getLeaderboards', false, { limit = limit })
    cb(resp)
end)

RegisterNUICallback('kosMenu:getLeaderboardPlayers', function(data, cb)
    local limit = normalizeLimit(data)
    local offset = normalizeOffset(data)
    local query = data and tostring(data.query or '') or ''
    local resp = lib.callback.await('kos:server:getLeaderboardPlayers', false, { limit = limit, offset = offset, query = query })
    cb(resp)
end)

RegisterNUICallback('kosMenu:getLeaderboardGangs', function(data, cb)
    local limit = normalizeLimit(data)
    local offset = normalizeOffset(data)
    local query = data and tostring(data.query or '') or ''
    local resp = lib.callback.await('kos:server:getLeaderboardGangs', false, { limit = limit, offset = offset, query = query })
    cb(resp)
end)

RegisterNUICallback('kosMenu:getMatchHistory', function(data, cb)
    local limit = normalizeLimit(data)
    local offset = normalizeOffset(data)
    local resp = lib.callback.await('kos:server:getMatchHistory', false, { limit = limit, offset = offset })
    cb(resp)
end)

RegisterNUICallback('kosMenu:getMatchHistoryDetail', function(data, cb)
    local id = data and tonumber(data.id) or 0
    id = math.floor(id)
    if id <= 0 then
        return cb(nil)
    end
    local resp = lib.callback.await('kos:server:getMatchHistoryDetail', false, { id = id })
    return cb(resp)
end)

RegisterNUICallback('kosMenu:createMatch', function(data, cb)
    local resp = lib.callback.await('kos:server:createMatchFromMenu', false, data or {})
    return cb(resp)
end)

RegisterNetEvent('kos:client:addKill', function(kill)
    if not kill or type(kill) ~= 'table' then
        return
    end
    SendReactMessage('newKill', kill)
end)

RegisterNUICallback('kosMenu:getOnlinePlayers', function(data, cb)
    local resp = lib.callback.await('kos:server:getOnlinePlayers', false, data or {})
    return cb(resp)
end)

RegisterNUICallback('kosMenu:getActiveMatches', function(_, cb)
    local resp = lib.callback.await('kos:server:getActiveMatches', false, {})
    return cb(resp)
end)

RegisterNUICallback('kosMenu:activeMatchAction', function(data, cb)
    local resp = lib.callback.await('kos:server:activeMatchAction', false, data or {})
    return cb(resp)
end)
