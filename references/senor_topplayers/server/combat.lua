local deathCooldown = {}
local cooldownDurationMs = (Config.combat and Config.combat.deathCooldownMs) or 1500

local function isEntityPed(entity)
    return GetEntityType(entity) == 1
end

AddEventHandler('weaponDamageEvent', function(sender, data)
    if not data then return end

    local attackerId = tonumber(sender)
    if not attackerId or attackerId < 1 then attackerId = nil end

    if attackerId then
        loadPlayerIntoCache(attackerId)
    end
    local damageAmount = type(data.weaponDamage) == 'number' and data.weaponDamage or (type(data.damage) == 'number' and data.damage or 0)
    if damageAmount > 0 and attackerId and PlayerStats[attackerId] then
        PlayerStats[attackerId].damage = (PlayerStats[attackerId].damage or 0) + damageAmount
        PlayerStats[attackerId].dirty = true
    end

    if not Config.headshotsOnKillOnly and attackerId and PlayerStats[attackerId] and data.hitComponent == 20 then
        local entity = NetworkGetEntityFromNetworkId(data.hitGlobalId)
        if DoesEntityExist(entity) and isEntityPed(entity) and IsPedAPlayer(entity) and NetworkGetEntityOwner(entity) then
            PlayerStats[attackerId].headshots = (PlayerStats[attackerId].headshots or 0) + 1
            PlayerStats[attackerId].dirty = true
        end
    end

    if not data.willKill then return end

    local entity = NetworkGetEntityFromNetworkId(data.hitGlobalId)
    if not DoesEntityExist(entity) or not isEntityPed(entity) or not IsPedAPlayer(entity) then
        return
    end

    local victimId = NetworkGetEntityOwner(entity)
    if not victimId then return end

    loadPlayerIntoCache(victimId)

    local now = GetGameTimer()
    if deathCooldown[victimId] and now < deathCooldown[victimId] then
        return
    end
    deathCooldown[victimId] = now + cooldownDurationMs

    local killerId = attackerId

    if killerId and PlayerStats[killerId] then
        PlayerStats[killerId].kills = (PlayerStats[killerId].kills or 0) + 1
        PlayerStats[killerId].dirty = true
        if Config.headshotsOnKillOnly and data.hitComponent == 20 then
            PlayerStats[killerId].headshots = (PlayerStats[killerId].headshots or 0) + 1
        end
    end
    if PlayerStats[victimId] then
        PlayerStats[victimId].deaths = (PlayerStats[victimId].deaths or 0) + 1
        PlayerStats[victimId].dirty = true
    end
end)
