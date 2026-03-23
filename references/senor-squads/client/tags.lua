isPlayerIdsEnabled = false
local playerGamerTags = {}
local distanceToCheck = Config.Settings['TagsDistance']

local fivemGamerTagCompsEnum = {
    GamerName = 0,
    CrewTag = 1,
    HealthArmour = 2,
    BigText = 3,
    AudioIcon = 4,
    UsingMenu = 5,
    PassiveMode = 6,
    WantedStars = 7,
    Driver = 8,
    CoDriver = 9,
    Tagged = 12,
    GamerNameNearby = 13,
    Arrow = 14,
    Packages = 15,
    InvIfPedIsFollowing = 16,
    RankText = 17,
    Typing = 18
}

local function cleanAllGamerTags()
    --debugprint('Cleaning up gamer tags table')
    for serverId, data in pairs(playerGamerTags) do
        if data and data.gamerTag and IsMpGamerTagActive(data.gamerTag) then
            RemoveMpGamerTag(data.gamerTag)
        end
    end
    playerGamerTags = {}
end

local tagColor = Config.Settings['TagColor']

local function setGamerTagFivem(targetTag)
    -- Setup name
    SetMpGamerTagVisibility(targetTag, fivemGamerTagCompsEnum.GamerName, true)

    -- Setup Health
    SetMpGamerTagHealthBarColor(targetTag, 129)
    SetMpGamerTagAlpha(targetTag, fivemGamerTagCompsEnum.HealthArmour, 255)
    SetMpGamerTagVisibility(targetTag, fivemGamerTagCompsEnum.HealthArmour, true)

    -- Setup AudioIcon
    SetMpGamerTagAlpha(targetTag, fivemGamerTagCompsEnum.AudioIcon, 255)

    SetMpGamerTagColour(targetTag, fivemGamerTagCompsEnum.AudioIcon, tagColor)
    SetMpGamerTagColour(targetTag, fivemGamerTagCompsEnum.GamerName, tagColor)
end

--- Clears a single gamer tag (fivem)
local function clearGamerTagFivem(targetTag)
    -- Cleanup name
    SetMpGamerTagVisibility(targetTag, fivemGamerTagCompsEnum.GamerName, false)
    -- Cleanup Health
    SetMpGamerTagVisibility(targetTag, fivemGamerTagCompsEnum.HealthArmour, false)
    -- Cleanup AudioIcon
    SetMpGamerTagVisibility(targetTag, fivemGamerTagCompsEnum.AudioIcon, false)
end

local setGamerTagFunc = setGamerTagFivem
local clearGamerTagFunc = clearGamerTagFivem

local function showGamerTags()
    local myId = cache.serverId
    local myPed = cache.ped

    -- First, handle nametags for other players
    for _, player in ipairs(Squad.mySquad.players) do
        local targetPed = GetPlayerPed(GetPlayerFromServerId(player.serverId))
        local serverId = player.serverId

        if serverId ~= myId and targetPed ~= myPed then
            if DoesEntityExist(targetPed) then
                -- If we have not yet indexed this player or their tag has somehow dissapeared
                if
                    not playerGamerTags[serverId]
                    or playerGamerTags[serverId].ped ~= targetPed
                    or not IsMpGamerTagActive(playerGamerTags[serverId].gamerTag)
                then
                    local playerName = string.sub(player.name or "unknown", 1, 75)
                    local playerStr = '[' .. serverId .. ']' .. ' ' .. playerName
                    if playerGamerTags[serverId] and playerGamerTags[serverId].gamerTag then
                        clearGamerTagFunc(playerGamerTags[serverId].gamerTag)
                    end
                    playerGamerTags[serverId] = {
                        gamerTag = CreateFakeMpGamerTag(targetPed, playerStr, false, false, Squad.mySquad.name, 0),
                        ped = targetPed
                    }
                end
                local targetTag = playerGamerTags[serverId].gamerTag

                -- Distance Check
                local targetPedCoords = GetEntityCoords(targetPed)
                if #(targetPedCoords - GetEntityCoords(myPed)) <= distanceToCheck then
                    setGamerTagFunc(targetTag)
                else
                    clearGamerTagFunc(targetTag)
                end
            else
                -- If the targetPed no longer exists, clear the nametag if it exists
                if playerGamerTags[serverId] and playerGamerTags[serverId].gamerTag then
                    clearGamerTagFunc(playerGamerTags[serverId].gamerTag)
                    playerGamerTags[serverId] = nil -- Remove the entry
                end
            end
        end
    end

    -- After processing other players, explicitly clear your own nametag if it exists
    if playerGamerTags[myId] and playerGamerTags[myId].gamerTag then
        clearGamerTagFunc(playerGamerTags[myId].gamerTag)
        playerGamerTags[myId] = nil -- Remove your entry from the table
    end
end

--- Starts the gamer tag thread
--- Increasing/decreasing the delay realistically only reflects on the
--- delay for the VOIP indicator icon, 250 is fine
local function createGamerTagThread()
    --debugprint('Starting gamer tag thread')
    CreateThread(function()
        while isPlayerIdsEnabled do
            showGamerTags()
            Wait(250)
        end

        -- Remove all gamer tags and clear out active table
        cleanAllGamerTags()
    end)
end

--- Function to enable or disable the player ids
function ToggleShowPlayerIDs(enabled)
    if not Config.Settings['Tags'] then return end

    isPlayerIdsEnabled = enabled
    if isPlayerIdsEnabled then
        createGamerTagThread()
    else
        cleanAllGamerTags()
    end
end

AddEventHandler('onResourceStop', function(resourceName)
    if (GetCurrentResourceName() == resourceName) then
        cleanAllGamerTags()
    end
end)