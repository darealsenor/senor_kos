

local activeGroupHash = nil

local function buildRelationshipName(snapshot)
    if not snapshot or not snapshot.matchId then
        return nil
    end

    local teamId = KOSState.getMyTeam()
    if not teamId then
        return nil
    end

    return ('kos_%s_%s'):format(snapshot.matchId, teamId)
end

local function resetRelations()
    if not Config.Relations then return end
    local hadKosRelations = activeGroupHash ~= nil
    local playerGroup = GetHashKey('PLAYER')
    SetPedRelationshipGroupHash(cache.ped, playerGroup)
    SetEntityCanBeDamagedByRelationshipGroup(cache.ped, true, playerGroup)
    activeGroupHash = nil

    if hadKosRelations then
        -- would only work for senor-squads (v1.1.3)
        TriggerEvent('squads:client:refreshRelations')
    end
end

local function applyRelations(snapshot)
    if not Config.Relations then return end
    local relationshipName = buildRelationshipName(snapshot)
    if not relationshipName then
        resetRelations()
        return
    end

    local _, relationshipHash = AddRelationshipGroup(relationshipName)
    SetPedRelationshipGroupHash(cache.ped, relationshipHash)
    SetEntityCanBeDamagedByRelationshipGroup(cache.ped, false, relationshipHash)
    activeGroupHash = relationshipHash
end

AddEventHandler(Events.CLIENT_STATE_UPDATED, function(snapshot)
    if not Config.Relations then return end
    if not cache.ped or cache.ped == 0 then
        return
    end

    if snapshot and snapshot.inMatch then
        applyRelations(snapshot)
        return
    end

    resetRelations()
end)

AddEventHandler('onResourceStop', function(resourceName)
    if resourceName ~= cache.resource then
        return
    end

    if activeGroupHash then
        resetRelations()
    end
end)
