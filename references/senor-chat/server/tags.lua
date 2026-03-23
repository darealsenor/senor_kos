local function getOwnedTagsAndColors(uRoles)
    local ownedTags = {}
    local ownedColors = {}

    for _, roleId in ipairs(uRoles) do
        local roleNum = roleId

        for _, tag in ipairs(Config.Tags) do
            if tag.id == roleNum then
                table.insert(ownedTags, tag)
            end
        end

        for _, color in ipairs(Config.Colors) do
            if color.id == roleNum then
                table.insert(ownedColors, color)
            end
        end
    end

    return { tags = ownedTags, colors = ownedColors }
end

function doesPlayerHaveTag(playerTags, id)
    for i = 1, #playerTags do
        if playerTags[i].id == id then
            return playerTags[i]
        end
    end

    return false
end

function doesPlayerHaveColor(playerColors, id)
    for i = 1, #playerColors do
        if playerColors[i].id == id then
            return playerColors[i]
        end
    end

    return false
end

local function getCustomTagsAndColors(playerId)
    local identifierTypes = { 'license', 'discord', 'steam', 'xbl', 'live', 'ip' }
    local customTags
    local customColors
    
    if Config.CustomPlayerTags and Config.CustomPlayerTags.enabled and Config.CustomPlayerTags.players then
        for _, idType in ipairs(identifierTypes) do
            local identifier = GetPlayerIdentifierByType(playerId, idType)
            if identifier and Config.CustomPlayerTags.players[identifier] then
                customTags = Config.CustomPlayerTags.players[identifier]
                break
            end
        end
    end
    
    if Config.CustomPlayerColors and Config.CustomPlayerColors.enabled and Config.CustomPlayerColors.players then
        for _, idType in ipairs(identifierTypes) do
            local identifier = GetPlayerIdentifierByType(playerId, idType)
            if identifier and Config.CustomPlayerColors.players[identifier] then
                customColors = Config.CustomPlayerColors.players[identifier]
                break
            end
        end
    end
    
    return customTags, customColors
end

function validatePlayerTagsAndColors(playerId)
    local player = Bridge.framework.GetPlayer(playerId)
    if not player then return end

    local license = GetPlayerIdentifierByType(playerId, 'license')
    if not license then return end

    local roles = GetDiscordRoles(playerId)
    local owned = getOwnedTagsAndColors(roles)
    
    local customTags, customColors = getCustomTagsAndColors(playerId)
    local safe = license:gsub(":", "_")
    local tagMap = {}
    local colorMap = {}
    
    if customTags then
        for i, ctag in ipairs(customTags) do
            if not ctag.id then
                ctag.id = "custom_" .. safe .. "_tag_" .. i
            end
            tagMap[ctag.id] = ctag
            local found = false
            for _, otag in ipairs(owned.tags) do
                if otag.id == ctag.id then
                    found = true
                    break
                end
            end
            if not found then
                table.insert(owned.tags, ctag)
            end
        end
    end
    
    if customColors then
        for i, ccolor in ipairs(customColors) do
            if not ccolor.id then
                ccolor.id = "custom_" .. safe .. "_color_" .. i
            end
            colorMap[ccolor.id] = ccolor
            local found = false
            for _, ocolor in ipairs(owned.colors) do
                if ocolor.id == ccolor.id then
                    found = true
                    break
                end
            end
            if not found then
                table.insert(owned.colors, ccolor)
            end
        end
    end
    
    local chatData = LoadChatData(license) or {
        tags = {},
        colors = {},
        selectedTag = nil,
        selectedColor = nil
    }
    
    local tags = chatData.tags or {}
    local colors = chatData.colors or {}
    local selTag = chatData.selectedTag
    local selColor = chatData.selectedColor
    
    local dirty = false
    local newTags = {}
    local newColors = {}
    
    for _, tag in ipairs(tags) do
        local use = tagMap[tag.id] or tag
        local valid = tagMap[tag.id] ~= nil
        
        if not valid then
            for _, otag in ipairs(owned.tags) do
                if otag.id == tag.id then
                    valid = true
                    break
                end
            end
        end
        
        if valid then
            table.insert(newTags, use)
        else
            dirty = true
        end
    end
    
    for _, color in ipairs(colors) do
        local use = colorMap[color.id] or color
        local valid = colorMap[color.id] ~= nil
        
        if not valid then
            for _, ocolor in ipairs(owned.colors) do
                if ocolor.id == color.id then
                    valid = true
                    break
                end
            end
        end
        
        if valid then
            table.insert(newColors, use)
        else
            dirty = true
        end
    end
    
    for _, otag in ipairs(owned.tags) do
        local found = false
        for _, ntag in ipairs(newTags) do
            if ntag.id == otag.id then
                found = true
                break
            end
        end
        if not found then
            table.insert(newTags, otag)
            dirty = true
        end
    end
    
    for _, ocolor in ipairs(owned.colors) do
        local found = false
        for _, ncolor in ipairs(newColors) do
            if ncolor.id == ocolor.id then
                found = true
                break
            end
        end
        if not found then
            table.insert(newColors, ocolor)
            dirty = true
        end
    end
    
    if selTag then
        local selTags = type(selTag) == 'table' and (selTag[1] and selTag[1].id and selTag or {selTag}) or {selTag}
        local valid = {}
        for _, st in ipairs(selTags) do
            for _, tag in ipairs(newTags) do
                if tag.id == st.id then
                    table.insert(valid, tag)
                    break
                end
            end
        end
        if #valid == 0 then
            selTag = nil
            dirty = true
        elseif #valid ~= #selTags then
            selTag = #valid == 1 and valid[1] or valid
            dirty = true
        end
    end
    
    if selColor then
        local found = false
        for _, color in ipairs(newColors) do
            if color.id == selColor.id then
                found = true
                break
            end
        end
        if not found then
            selColor = nil
            dirty = true
        end
    end
    
    if dirty then
        SaveChatData(license, {
            tags = newTags,
            colors = newColors,
            selectedTag = selTag,
            selectedColor = selColor
        })
        
        chat.players[playerId] = nil
        
        if selTag then
            local tags = type(selTag) == 'table' and (selTag[1] and selTag[1].id and selTag or {selTag}) or {selTag}
            chat:UpdateAttribute(playerId, 'tags', tags)
        else
            chat:UpdateAttribute(playerId, 'tags', {})
        end
        
        if selColor then
            chat:UpdateAttribute(playerId, 'color', selColor)
        else
            chat:UpdateAttribute(playerId, 'color', nil)
        end
        
        local clientTag = selTag
        if selTag then
            clientTag = type(selTag) == 'table' and (selTag[1] and selTag[1].id and selTag or {selTag}) or selTag
        end
        
        TriggerClientEvent('senor-chat:client:metaUpdate', playerId, {
            tags = newTags,
            colors = newColors,
            selectedTag = clientTag,
            selectedColor = selColor
        })
    end
    
    return newTags, newColors, selTag, selColor
end

RegisterNetEvent('dynasty:server:updateMeta')
AddEventHandler('dynasty:server:updateMeta', function()
    local playerId = source
    validatePlayerTagsAndColors(playerId)
end)

RegisterNetEvent('senor-chat:server:updateSelectedTag')
AddEventHandler('senor-chat:server:updateSelectedTag', function(tagIds)
    local playerId = source
    local license = GetPlayerIdentifierByType(playerId, 'license')
    if not license then return end

    local chatData = LoadChatData(license) or { tags = {}, colors = {} }

    if tagIds == nil or (type(tagIds) == 'table' and #tagIds == 0) then
        SaveChatData(license, {
            tags = chatData.tags,
            colors = chatData.colors,
            selectedTag = nil,
            selectedColor = chatData.selectedColor
        })
        chat:UpdateAttribute(playerId, 'tags', {})
        chat.players[playerId] = nil
        return
    end

    local selectedTags = {}
    if type(tagIds) == 'table' then
        for _, tagId in ipairs(tagIds) do
            local tag = doesPlayerHaveTag(chatData.tags, tagId)
            if tag then
                table.insert(selectedTags, tag)
            end
        end
    else
        local tag = doesPlayerHaveTag(chatData.tags, tagIds)
        if tag then
            table.insert(selectedTags, tag)
        end
    end

    if #selectedTags == 0 then return end
    
    local maxTags = GetMaxCustomTags()
    if #selectedTags > maxTags then
        local limited = {}
        for i = 1, maxTags do
            if selectedTags[i] then
                table.insert(limited, selectedTags[i])
            end
        end
        selectedTags = limited
        if #selectedTags == 0 then return end
    end
    
    local selectedTagForStorage = #selectedTags == 1 and selectedTags[1] or selectedTags
    
    SaveChatData(license, {
        tags = chatData.tags,
        colors = chatData.colors,
        selectedTag = selectedTagForStorage,
        selectedColor = chatData.selectedColor
    })
    chat:UpdateAttribute(playerId, 'tags', selectedTags)
    chat.players[playerId] = nil
end)

RegisterNetEvent('senor-chat:server:updateSelectedColor')
AddEventHandler('senor-chat:server:updateSelectedColor', function(colorId)
    local playerId = source
    local license = GetPlayerIdentifierByType(playerId, 'license')
    if not license then return end

    local chatData = LoadChatData(license) or { tags = {}, colors = {} }

    if colorId == nil then
        SaveChatData(license, {
            tags = chatData.tags,
            colors = chatData.colors,
            selectedTag = chatData.selectedTag,
            selectedColor = nil
        })
        chat:UpdateAttribute(playerId, 'color', nil)
        chat.players[playerId] = nil
        return
    end

    local color = doesPlayerHaveColor(chatData.colors, colorId)
    if not color then return end
    
    SaveChatData(license, {
        tags = chatData.tags,
        colors = chatData.colors,
        selectedTag = chatData.selectedTag,
        selectedColor = color
    })
    chat:UpdateAttribute(playerId, 'color', color)
    chat.players[playerId] = nil
end)

AddEventHandler('onServerResourceStart', function(resName)
    if resName == GetCurrentResourceName() then
        Wait(2000)
        for _, pid in ipairs(GetPlayers()) do
            validatePlayerTagsAndColors(tonumber(pid))
        end
    end
end)

AddEventHandler('senor-chat:playerLoaded', function(playerId)
    Wait(2000)
    validatePlayerTagsAndColors(playerId)
end)

