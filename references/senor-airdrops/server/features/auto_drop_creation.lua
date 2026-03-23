local managerService = require 'server.services.manager_service'
local Airdrop = exports[GetCurrentResourceName()]

local function GetRandomWeapons()
    local randomnumber = math.random(0, Config.AutoDrop.WeaponRandomMax)
    if randomnumber > Config.AutoDrop.WeaponRandomThreshold then return 'Pistols' else return 'Regular' end
end

local function dropData(playerId, coords, lockTime, distance, weapons, settings)
    return {
        playerId = playerId,
        coords = coords,
        lockTime = lockTime or Config.AutoDrop.DefaultLockTime,
        distance = distance or Config.AutoDrop.DefaultDistance,
        weapons = weapons or Config.AutoDrop.DefaultWeapons or GetRandomWeapons(),
        settings = settings or {},
    }
end

local function countDrops()
    local drops = managerService.GetAirdrops(false)
    if not next(drops) then return 0 end
    local counter = 0

    for k, v in pairs(drops) do
        counter = counter + 1
    end
    return counter
end

local function CreateDrop()
    local GetDropData = dropData(0)
    Airdrop:CreateDrop(GetDropData)
end

local function createAutoAirdrop()
    if not Config.AutoDrop.Enabled then return end
    local _countDrops = countDrops()
    if _countDrops >= Config.AutoDrop.MaxConcurrentDrops then return end
    CreateDrop()
end

CreateThread(function()
    while true do
        Wait(Config.AutoDrop.CreationInterval * 1000)
        createAutoAirdrop()
    end
end)
