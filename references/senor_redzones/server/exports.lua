exports('getZones', function(raw, forClients)
    return Manager.GetZones(raw, forClients)
end)

exports('getZoneById', function(id)
    return Manager.GetZoneById(id)
end)

exports('getZoneByPlayer', function(source)
    return Manager.GetZoneByPlayer(source)
end)

exports('createTemporaryZone', function(data)
    return Manager.CreateTemporaryZone(data)
end)

exports('createPermanentZone', function(data)
    return Manager.CreatePermanentZone(data)
end)

exports('removeZone', function(zoneInstance)
    return Manager.RemoveZone(zoneInstance)
end)

exports('updateZone', function(zoneInstance, data)
    return Manager.UpdateZone(zoneInstance, data)
end)