local adminOpen = false

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
    description = 'Toggle KOS scoreboard',
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

RegisterNetEvent(Events.CLIENT_OPEN_ADMIN, function()
    adminOpen = true
    SendReactMessage('setVisible', true)
    SendReactMessage('adminOpen', {})
    SetNuiFocus(true, true)
end)

RegisterNUICallback('hideFrame', function(_, cb)
    local wasAdmin = adminOpen
    adminOpen = false
    applyFrameVisibility()
    if wasAdmin then
        SendReactMessage('adminClosed', {})
    end
    cb({})
end)

CreateThread(function()
    Wait(400)
    pushMatchToNui()
    applyFrameVisibility()
end)
