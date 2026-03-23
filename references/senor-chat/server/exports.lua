exports('validatePlayerTagsAndColors', function(playerId)
    if not playerId then return false end
    if not validatePlayerTagsAndColors then return false end
    
    local ok, result = pcall(validatePlayerTagsAndColors, playerId)
    return ok and result ~= nil
end)

exports('addCustomSuggestion', function(playerId, name, help, params)
    if not playerId or not name then return false end
    
    local cmd = name:sub(1, 1) == '/' and name or '/' .. name
    TriggerClientEvent('chat:addSuggestion', playerId, {
        name = cmd,
        help = help or '',
        params = params or {}
    })
    return true
end)

exports('addMessage', function(target, message)
    local targetId = -1
    local msg = message or target
    
    if not msg then return false end
    
    if target and type(target) == 'number' and message then
        targetId = target
    end
    
    local msgText = type(msg) == 'string' and msg or (msg.args and msg.args[#msg.args] or msg.message or '')
    local sender = type(msg) == 'table' and msg.args and #msg.args > 1 and msg.args[1] or 'SYSTEM'
    local channel = chat:GetChannelByName("Global")
    
    if not channel then return false end
    
    chat:LocalMessage(targetId == -1 and -1 or targetId, {
        message = msgText,
        sender = sender,
        channel = channel,
        tags = {}
    })
    return true
end)

exports('addChannel', function(channelName, channelId, timeout)
    if not channelName then return false end
    return chat:AddChannel(channelName, channelId, timeout) == true
end)

exports('getChannel', function(channelName)
    if not channelName then return false end
    return chat:GetChannelByName(channelName) or false
end)

exports('getChannelById', function(channelId)
    if not channelId then return false end
    return chat:GetChannelById(channelId) or false
end)

exports('getChannels', function()
    return chat:GetChannels() or {}
end)

exports('hasChannelAccess', function(playerId, channelName)
    if not playerId or not channelName then return false end
    return chat:HasChannelAccess(playerId, channelName) == true
end)

exports('isUserMuted', function(playerId)
    if not playerId then return false end
    return chat:IsUserMuted(playerId)
end)

exports('muteUser', function(playerId, durationMinutes, adminId, reason, notify, channel)
    if not playerId or not durationMinutes then return false end
    return chat:MuteUser(playerId, durationMinutes, adminId, reason, notify, channel) == true
end)

exports('unmuteUser', function(playerId, adminId)
    if not playerId then return false end
    return chat:UnmuteUser(playerId, adminId) == true
end)

exports('deleteMessage', function(messageId, messageChannel, adminId)
    if not messageId or not messageChannel then return false end
    chat:deleteMessage(messageId, messageChannel, adminId)
    return true
end)

exports('sendStaffMessage', function(data)
    if not data then return false end
    chat:StaffMessage(data)
    return true
end)

exports('sendLocalMessage', function(playerId, data)
    if not playerId or not data then return false end
    chat:LocalMessage(playerId, data)
    return true
end)

exports('sendMessage', function(playerId, data)
    if not playerId or not data then return false end
    return chat:Message(playerId, data) or false
end)

exports('getPlayerInfo', function(playerId)
    if not playerId then return nil end
    return chat:GetPlayerAttributes(playerId)
end)

exports('getPlayerTags', function(playerId)
    if not playerId then return nil end
    local license = GetPlayerIdentifierByType(playerId, 'license')
    if not license then return nil end
    
    local data = LoadChatData(license)
    if not data then return {} end
    
    return data.tags or {}
end)

exports('getPlayerColors', function(playerId)
    if not playerId then return nil end
    local license = GetPlayerIdentifierByType(playerId, 'license')
    if not license then return nil end
    
    local data = LoadChatData(license)
    if not data then return {} end
    
    return data.colors or {}
end)

exports('getPlayerSelectedTag', function(playerId)
    if not playerId then return nil end
    local license = GetPlayerIdentifierByType(playerId, 'license')
    if not license then return nil end
    
    local data = LoadChatData(license)
    if not data then return nil end
    
    return data.selectedTag
end)

exports('getPlayerSelectedColor', function(playerId)
    if not playerId then return nil end
    local license = GetPlayerIdentifierByType(playerId, 'license')
    if not license then return nil end
    
    local data = LoadChatData(license)
    if not data then return nil end
    
    return data.selectedColor
end)

exports('setPlayerSelectedTag', function(playerId, tagId)
    if not playerId then return false end
    local license = GetPlayerIdentifierByType(playerId, 'license')
    if not license then return false end
    
    local chatData = LoadChatData(license) or { tags = {}, colors = {} }
    
    if not tagId then
        SaveChatData(license, {
            tags = chatData.tags,
            colors = chatData.colors,
            selectedTag = nil,
            selectedColor = chatData.selectedColor
        })
        chat:UpdateAttribute(playerId, 'tags', {})
        chat.players[playerId] = nil
        return true
    end
    
    local tag = doesPlayerHaveTag(chatData.tags, tagId)
    if not tag then return false end
    
    local selectedTagForStorage = tag
    SaveChatData(license, {
        tags = chatData.tags,
        colors = chatData.colors,
        selectedTag = selectedTagForStorage,
        selectedColor = chatData.selectedColor
    })
    chat:UpdateAttribute(playerId, 'tags', { tag })
    chat.players[playerId] = nil
    
    TriggerClientEvent('senor-chat:client:metaUpdate', playerId, {
        tags = chatData.tags,
        colors = chatData.colors,
        selectedTag = tag,
        selectedColor = chatData.selectedColor
    })
    
    return true
end)

exports('setPlayerSelectedColor', function(playerId, colorId)
    if not playerId then return false end
    local license = GetPlayerIdentifierByType(playerId, 'license')
    if not license then return false end
    
    local chatData = LoadChatData(license) or { tags = {}, colors = {} }
    
    if not colorId then
        SaveChatData(license, {
            tags = chatData.tags,
            colors = chatData.colors,
            selectedTag = chatData.selectedTag,
            selectedColor = nil
        })
        chat:UpdateAttribute(playerId, 'color', nil)
        chat.players[playerId] = nil
        return true
    end
    
    local color = doesPlayerHaveColor(chatData.colors, colorId)
    if not color then return false end
    
    SaveChatData(license, {
        tags = chatData.tags,
        colors = chatData.colors,
        selectedTag = chatData.selectedTag,
        selectedColor = color
    })
    chat:UpdateAttribute(playerId, 'color', color)
    chat.players[playerId] = nil
    
    TriggerClientEvent('senor-chat:client:metaUpdate', playerId, {
        tags = chatData.tags,
        colors = chatData.colors,
        selectedTag = chatData.selectedTag,
        selectedColor = color
    })
    
    return true
end)

exports('addPlayerTag', function(playerId, tag)
    if not playerId or not tag then return false end
    local license = GetPlayerIdentifierByType(playerId, 'license')
    if not license then return false end
    
    local chatData = LoadChatData(license) or { tags = {}, colors = {}, selectedTag = nil, selectedColor = nil }
    local tags = chatData.tags or {}
    
    if not tag.id then
        local safe = license:gsub(":", "_")
        tag.id = "custom_" .. safe .. "_tag_" .. (#tags + 1)
    end
    
    for _, existingTag in ipairs(tags) do
        if existingTag.id == tag.id then
            return false
        end
    end
    
    table.insert(tags, tag)
    
    SaveChatData(license, {
        tags = tags,
        colors = chatData.colors,
        selectedTag = chatData.selectedTag,
        selectedColor = chatData.selectedColor
    })
    
    chat.players[playerId] = nil
    validatePlayerTagsAndColors(playerId)
    
    return true
end)

exports('removePlayerTag', function(playerId, tagId)
    if not playerId or not tagId then return false end
    local license = GetPlayerIdentifierByType(playerId, 'license')
    if not license then return false end
    
    local chatData = LoadChatData(license) or { tags = {}, colors = {}, selectedTag = nil, selectedColor = nil }
    local tags = chatData.tags or {}
    local newTags = {}
    local removed = false
    
    for _, tag in ipairs(tags) do
        if tag.id ~= tagId then
            table.insert(newTags, tag)
        else
            removed = true
        end
    end
    
    if not removed then return false end
    
    local selTag = chatData.selectedTag
    if selTag then
        local selTags = type(selTag) == 'table' and (selTag[1] and selTag[1].id and selTag or {selTag}) or {selTag}
        local valid = {}
        for _, st in ipairs(selTags) do
            if st.id ~= tagId then
                for _, tag in ipairs(newTags) do
                    if tag.id == st.id then
                        table.insert(valid, tag)
                        break
                    end
                end
            end
        end
        if #valid == 0 then
            selTag = nil
        elseif #valid ~= #selTags then
            selTag = #valid == 1 and valid[1] or valid
        end
    end
    
    SaveChatData(license, {
        tags = newTags,
        colors = chatData.colors,
        selectedTag = selTag,
        selectedColor = chatData.selectedColor
    })
    
    if selTag then
        local tags = type(selTag) == 'table' and (selTag[1] and selTag[1].id and selTag or {selTag}) or {selTag}
        chat:UpdateAttribute(playerId, 'tags', tags)
    else
        chat:UpdateAttribute(playerId, 'tags', {})
    end
    
    chat.players[playerId] = nil
    
    TriggerClientEvent('senor-chat:client:metaUpdate', playerId, {
        tags = newTags,
        colors = chatData.colors,
        selectedTag = selTag,
        selectedColor = chatData.selectedColor
    })
    
    return true
end)

exports('addPlayerColor', function(playerId, color)
    if not playerId or not color then return false end
    local license = GetPlayerIdentifierByType(playerId, 'license')
    if not license then return false end
    
    local chatData = LoadChatData(license) or { tags = {}, colors = {}, selectedTag = nil, selectedColor = nil }
    local colors = chatData.colors or {}
    
    if not color.id then
        local safe = license:gsub(":", "_")
        color.id = "custom_" .. safe .. "_color_" .. (#colors + 1)
    end
    
    for _, existingColor in ipairs(colors) do
        if existingColor.id == color.id then
            return false
        end
    end
    
    table.insert(colors, color)
    
    SaveChatData(license, {
        tags = chatData.tags,
        colors = colors,
        selectedTag = chatData.selectedTag,
        selectedColor = chatData.selectedColor
    })
    
    chat.players[playerId] = nil
    validatePlayerTagsAndColors(playerId)
    
    return true
end)

exports('removePlayerColor', function(playerId, colorId)
    if not playerId or not colorId then return false end
    local license = GetPlayerIdentifierByType(playerId, 'license')
    if not license then return false end
    
    local chatData = LoadChatData(license) or { tags = {}, colors = {}, selectedTag = nil, selectedColor = nil }
    local colors = chatData.colors or {}
    local newColors = {}
    local removed = false
    
    for _, color in ipairs(colors) do
        if color.id ~= colorId then
            table.insert(newColors, color)
        else
            removed = true
        end
    end
    
    if not removed then return false end
    
    local selColor = chatData.selectedColor
    if selColor and selColor.id == colorId then
        selColor = nil
    end
    
    SaveChatData(license, {
        tags = chatData.tags,
        colors = newColors,
        selectedTag = chatData.selectedTag,
        selectedColor = selColor
    })
    
    if selColor then
        chat:UpdateAttribute(playerId, 'color', selColor)
    else
        chat:UpdateAttribute(playerId, 'color', nil)
    end
    
    chat.players[playerId] = nil
    
    TriggerClientEvent('senor-chat:client:metaUpdate', playerId, {
        tags = chatData.tags,
        colors = newColors,
        selectedTag = chatData.selectedTag,
        selectedColor = selColor
    })
    
    return true
end)