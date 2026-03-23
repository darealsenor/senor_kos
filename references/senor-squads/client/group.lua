function ToggleRelations(bool)
    if not Config.Settings['Relations'] then return end
    if bool then
        local squad = Squad.mySquad.id
        local _, relationship = AddRelationshipGroup(squad)
        SetPedRelationshipGroupHash(cache.ped, relationship)
        SetEntityCanBeDamagedByRelationshipGroup(cache.ped, false, relationship)
    else
        local playerGroup = GetHashKey("PLAYER")
        SetPedRelationshipGroupHash(cache.ped, playerGroup)
        SetEntityCanBeDamagedByRelationshipGroup(cache.ped, true, playerGroup)
    end
end

AddEventHandler('onResourceStop', function(resourceName)
    if (GetCurrentResourceName() == resourceName) then
        ToggleRelations(false)
    end
end)