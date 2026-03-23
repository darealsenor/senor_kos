Squad = {
    mySquad = nil,
    Settings = {
        Blips = {
            enabled = true,
            color = 2
        },
        Tags = true,
        Hud = true,
        Notifications = {
            chat = true
        },
        HudMaxDisplay = {
            mode = 'infinity',
            value = 4
        },
        ShowRadioIcon = true,
        HudPosition = { x = 0, y = 0 }
    },
    Blips = {},
    Thread = false,
    Messages = {},
    owner = false,
    toggledRelations = false
}

RegisterNetEvent('squad:client:SquadUpdate') -- Player Join/Leave/Removed etc..
AddEventHandler('squad:client:SquadUpdate', function(data)
    Squad.mySquad = data
    Squad.owner = data.players[cache.serverId].owner

    data.players = CleanNils(data.players)

    SendReactMessage('setMySquad', data)
    SendReactMessage('setIsOwner', Squad.owner)
    StartSquadFunctions(false)
end)

RegisterNetEvent('squad:client:SquadUpdateAttributes') -- Player Update (Health/Armour/Blips)
AddEventHandler('squad:client:SquadUpdateAttributes', function(data)
    Squad.mySquad = data
    Squad.owner = data.players[cache.serverId].owner
    
    local playersArray = CleanNils(data.players)
    data.players = playersArray
    
    local playersDict = {}
    for _, player in ipairs(playersArray) do
        if player and player.serverId then
            playersDict[player.serverId] = {
                serverId = player.serverId,
                health = player.health,
                armor = player.armor,
                coords = player.coords,
                entity = player.entity,
                network = player.network,
                isDead = player.isDead
            }
        end
    end

    SendReactMessage('updatePlayers', playersDict)
    StartSquadFunctions(true)
    SendReactMessage('setIsOwner', Squad.owner)

end)


RegisterNetEvent('squad:client:SquadRemoved')
AddEventHandler('squad:client:SquadRemoved', function()
    Squad.mySquad = nil
    Squad.Thread = false
    StartSquadFunctions(false)
    SendReactMessage('setMySquad', nil)
    SendReactMessage('ClearMessages')
end)

function StartSquadFunctions(bool)
    if not bool then
        ToggleBlips(false)
        ToggleHudThread(false)
        ToggleRelations(false)
        ToggleShowPlayerIDs(false)
        Squad.Thread = false
        return
    end
    if Squad.Settings.Blips.enabled then
        ToggleBlips(true)
    end

    if Squad.Settings.Hud then
        ToggleHudThread(true)
    end
    if Squad.Settings.Tags and not isPlayerIdsEnabled then
        ToggleShowPlayerIDs(true)
    end

    if not Squad.toggledRelations then
        ToggleRelations(true)
    end

    Squad.Thread = true
end


---@param data {player: {name: string, serverId: number, image: string, owner: boolean}, message: string, time: number}
local function addMessage(data)
    --lib.print.debug(data)
    Squad.Messages[#Squad.Messages + 1] = data
    SendReactMessage('NewMessage', data)

    if Squad.Settings.Notifications and Squad.Settings.Notifications.chat then
        if data.player and data.player.serverId and data.player.serverId ~= cache.serverId then
            PlaySoundFrontend(-1, 'CONFIRM_BEEP', 'HUD_MINI_GAME_SOUNDSET', true)
            lib.notify({
                title = locale('notification_chat_title'),
                description = ('%s: %s'):format(data.player.name, data.message),
                type = 'inform'
            })
        end
    end
end

RegisterNetEvent('squad:client:NewMessage')
AddEventHandler('squad:client:NewMessage', addMessage)


local initialImage = false

local function openSquadMenu()
    local availableSquads = lib.callback.await('squads:server:GetSquads', false)
    ToggleNuiFrame(true)
    SendReactMessage('setSquads', availableSquads)

    if not initialImage then
        local profilePicture = lib.callback.await('squads:server:GetProfilePicture', false)
        if profilePicture and profilePicture ~= '' then
            SendReactMessage('setInitialSquadImage', profilePicture)
        else
            SendReactMessage('setInitialSquadImage', Shared.FallbackImage)
        end
        initialImage = true
    end
end

RegisterNetEvent('squads:client:openMenu')
AddEventHandler('squads:client:openMenu', openSquadMenu)

RegisterCommand(Config.Settings['Menu_Command'], openSquadMenu, false)
