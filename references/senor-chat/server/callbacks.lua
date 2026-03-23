lib.callback.register('senor-chat:server:GetChatData', function(playerId)
    local license = GetPlayerIdentifierByType(playerId, 'license')
    if not license then
        return { tags = {}, colors = {}, selectedTag = nil, selectedColor = nil }
    end
    
    local data = LoadChatData(license)
    local selTag = data.selectedTag
    
    if selTag then
        selTag = type(selTag) == 'table' and (selTag[1] and selTag[1].id and selTag or {selTag}) or selTag
    end
    
    return {
        tags = data.tags or {},
        colors = data.colors or {},
        selectedTag = selTag,
        selectedColor = data.selectedColor
    }
end)

lib.callback.register('senor-chat:server:GetMuteStatus', function(playerId, targetId)
    if not HasPermission(playerId, Permissions.VIEW_MUTE_STATUS) then
        return nil
    end
    
    if not targetId then return nil end
    
    local isMuted, muteTimeRemaining = chat:IsUserMuted(targetId)
    
    return {
        isMuted = isMuted or false,
        muteTimeRemaining = muteTimeRemaining or 0
    }
end)

lib.callback.register('senor-chat:server:GetPlayerPermissions', function(playerId)
    return GetPlayerPermissions(playerId)
end)