if GetCurrentResourceName() ~= "senor-chat" then
    for i = 1, 100 do
        print(('^1[senor-chat] ^2WARNING: ^1Resource name should be ^3senor-chat^1, not ^3%s'):format(GetCurrentResourceName()))
        print('^1[senor-chat] ^2WARNING: ^1SCRIPT WILL NOT WORK UNTIL YOU FIX THIS ISSUE')
        Wait(3000)
    end
end

Chat = lib.class('Chat')

local idCounter = 1

local function createChannelTemplate(retrieveMessages, id, name, timeout)
    local shouldRetrieve = retrieveMessages == nil

    timeout = tonumber(timeout or 5)

    if shouldRetrieve then
        return {
            freeze = false,
            messages = {
            },
            id = id,
            name = name,
            timeout = timeout
        }
    end

    return {
        freeze = false,
        id = id,
        name = name,
        timeout = timeout
    }
end

function Chat:constructor()
    self.channels = {}
    self.lookupChannels = {}
    self.channelCooldowns = {}
    self.players = {}
    self.instance = self

    CreateThread(function()
        while true do
            Wait(60000)
            self:CleanupExpiredMutes()
        end
    end)
end

function Chat:GetPlayerAttributes(playerId)
    if self.players[playerId] then return self.players[playerId] end

    local player = Bridge.framework.GetPlayer(playerId)
    if not player then
        return {
            picture = Config.Avatar.FallbackImage,
            tags = { { bgColor = 'rgba(253, 126, 20, 0.1)', color = '#fd7e14', text = 'TX' } },
            color = nil,
            sender = 'SENOR',
            senderId = math.random(1, 1000)
        }
    end

    local license = GetPlayerIdentifierByType(playerId, 'license')
    local data = LoadChatData(license) or { tags = {}, colors = {}, selectedTag = nil, selectedColor = nil }

    local senderName
    if Config.NameSource == "Discord" then
        senderName = GetDiscordDisplayName(playerId)
        if not senderName then
            senderName = GetPlayerName(playerId)
        end
    elseif Config.NameSource == "Steam" then
        senderName = GetPlayerName(playerId)
    end
    if not senderName then
        senderName = Bridge.framework.GetPlayerName(playerId)
    end

    local attrs = {
        picture = GetProfilePicture(playerId),
        tags = data.selectedTag and (type(data.selectedTag) == 'table' and #data.selectedTag > 0 and data.selectedTag[1].id and data.selectedTag or { data.selectedTag }) or {},
        color = data.selectedColor,
        sender = senderName or "Unknown",
        senderId = playerId
    }

    local gangs = Bridge.framework.GetGangs()
    if gangs and player.PlayerData?.gang then
        attrs.gang = player.PlayerData.gang.label
    end

    attrs.admin = Bridge.framework.IsAdmin(playerId)
    self.players[playerId] = attrs
    return attrs
end

function Chat:IsInGang(playerId, gang)
    if not self.players[playerId] then
        self:GetPlayerAttributes(playerId)
    end
    return self.players[playerId].gang == gang
end

function Chat:IsAdmin(playerId)
    return self.players[playerId].admin
end

function Chat:UpdateAttribute(playerId, attribute, newVal)
    if self.players[playerId] and self.players[playerId][attribute] then
        self.players[playerId][attribute] = newVal
        return true
    end
    return false
end

function Chat:IsUserMuted(playerId)
    if not Config.Mute.adminsCanBeMuted then
        if self.players[playerId] and self.players[playerId].admin then return false end
    end

    local license = GetPlayerIdentifierByType(playerId, 'license')
    if not license then return false end

    local muteData = LoadMuteData(license)
    if not muteData or not muteData.muted_until then return false end

    local now = os.time()
    if now >= muteData.muted_until then
        RemoveMuteData(license)
        return false
    end

    return true, (muteData.muted_until - now)
end

function Chat:MuteUser(playerId, durationMinutes, adminId, reason, notify, channel)
    local license = GetPlayerIdentifierByType(playerId, 'license')
    if not license then return false end

    if not Config.Mute.allowMuteAdmins then
        if self.players[playerId] and self.players[playerId].admin then
            if adminId then
                self:LocalMessage(adminId, {
                    message = locale('message_cannot_mute_admins'),
                    channel = channel or { id = 0 }
                })
            end
            return false
        end
    end

    local adminLicense = adminId and GetPlayerIdentifierByType(adminId, 'license')
    local mutedUntil = os.time() + (durationMinutes * 60)

    SaveMuteData(license, {
        muted_until = mutedUntil,
        muted_by = adminLicense,
        reason = reason
    })

    if notify and channel then
        local muteMessage = reason
        if not muteMessage then
            muteMessage = locale('message_muted_minutes', durationMinutes)
        elseif adminId then
            local adminName = GetPlayerName(adminId)
            muteMessage = locale('message_muted_by_admin', adminName, adminId, durationMinutes, muteMessage)
        else
            muteMessage = locale('message_muted_with_reason', durationMinutes, muteMessage)
        end
        self:LocalMessage(playerId, { message = muteMessage, channel = channel })
    end

    if reason and adminId then
        local staffChannel = self:GetChannelByName("Staff")
        if staffChannel then
            self:StaffMessage({
                message = locale('message_staff_muted', GetPlayerName(adminId), adminId, GetPlayerName(playerId), playerId, durationMinutes, reason),
                channel = staffChannel
            })
        end
    elseif reason then
        local staffChannel = self:GetChannelByName("Staff")
        if staffChannel then
            self:StaffMessage({
                message = locale('message_staff_muted_no_admin', GetPlayerName(playerId), playerId, reason),
                channel = staffChannel
            })
        end
    end

    return true
end

function Chat:UnmuteUser(playerId, adminId)
    local license = GetPlayerIdentifierByType(playerId, 'license')
    if not license then return false end

    RemoveMuteData(license)
    return true
end

function Chat:CleanupExpiredMutes()
    MySQL.query.await([[
        DELETE FROM senor_chat_mutes
        WHERE muted_until IS NOT NULL AND muted_until < ?
    ]], { os.time() })
end

function Chat:LocalMessage(playerId, data)
    local attrs = self:GetPlayerAttributes(playerId)
    if not attrs then return end

    idCounter = idCounter + 1
    local msg = {
        id = idCounter,
        senderId = playerId,
        sender = data.sender or attrs.sender,
        message = data.message or '',
        picture = data.picture or attrs.picture,
        channel = { id = data.channel.id },
        tags = data.tags or attrs.tags,
        color = data.color or attrs.color
    }

    TriggerClientEvent('senor-chat:client:newMessage', playerId == -1 and -1 or playerId, msg)
    return msg
end

function Chat:StaffMessage(data)
    local staff = self:GetChannelByName("Staff")
    if not staff then return end

    idCounter = idCounter + 1
    local tags = data.tags or { { bgColor = 'rgba(253, 126, 20, 0.1)', color = '#fd7e14', text = 'ADMIN' } }
    
    local msg = {
        id = idCounter,
        senderId = 0,
        sender = data.sender or 'SYSTEM',
        message = data.message or '',
        picture = data.picture or Config.Avatar.FallbackImage,
        channel = { id = staff.id },
        tags = tags,
        color = nil
    }

    staff.messages[idCounter] = msg
    TriggerClientEvent('senor-chat:client:newMessage', -1, msg)
end

function Chat:HasChannelAccess(playerId, channelName)
    if channelName == "Global" then
        return true
    end
    
    local channel = self:GetChannelByName(channelName)
    if channel and channel.permission then
        return HasPermission(playerId, channel.permission)
    end
    
    local player = Bridge.framework.GetPlayer(playerId)
    if not player then return false end
    
    if player.gang and player.gang.label and player.gang.label == channelName and player.gang.label ~= 'No Gang' then
        return true
    end
    
    return false
end

function Chat:Message(playerId, data)
    local attrs = self:GetPlayerAttributes(playerId)
    if not attrs then return false, locale('message_error_no_attributes') end

    if not data.channel or not data.channel.name then
        return false, locale('message_error_no_channel')
    end
    
    if not self.channels[data.channel.name] then return false, locale('message_error_no_channel') end
    
    if not self:HasChannelAccess(playerId, data.channel.name) then
        self:LocalMessage(playerId, { message = locale('message_channel_no_access'), channel = data.channel })
        return false, locale('message_error_no_access')
    end

    local muted, timeLeft = self:IsUserMuted(playerId)
    if muted then
        self:LocalMessage(playerId, { 
            message = locale('message_muted_time_remaining', timeLeft), 
            channel = data.channel 
        })
        return false, locale('message_error_muted')
    end

    local channelTimeoutSeconds = self.channels[data.channel.name].timeout
    if channelTimeoutSeconds and channelTimeoutSeconds > 0 and not data.skipTimeout then
        local now = os.time()
        if not self.channelCooldowns[playerId] then
            self.channelCooldowns[playerId] = {}
        end

        local lastMessageTime = self.channelCooldowns[playerId][data.channel.name]
        if lastMessageTime then
            local timeSinceLastMessage = now - lastMessageTime
            if timeSinceLastMessage < channelTimeoutSeconds then
                local remainingTime = channelTimeoutSeconds - timeSinceLastMessage
                self:LocalMessage(playerId, {
                    message = locale('message_cooldown_wait', remainingTime),
                    channel = data.channel
                })
                return false, locale('message_error_channel_cooldown')
    end
        end

        self.channelCooldowns[playerId][data.channel.name] = now
    end

    local messageContent = data.message

    if Config.Blacklist and Config.Blacklist.enabled and Config.Words and type(Config.Words) == "table" and #Config.Words > 0 then
    local isBlacklist, blacklistedWord = StringFilter(data.message)
    if isBlacklist then
            if Config.Blacklist.action == "mute" then
                local timeoutMinutes = Config.Blacklist.muteDuration or 3
                self:MuteUser(playerId, timeoutMinutes, nil,
                    locale('message_blacklist_mute', blacklistedWord, timeoutMinutes), true, data.channel)
                return false, locale('message_error_blacklisted_word')
            elseif Config.Blacklist.action == "censor" then
                messageContent = "***"
            end
        end
    end

    idCounter = idCounter + 1

    local tags = data.tags or attrs.tags
    if data.tags and attrs.tags then
        tags = {}
        for _, tag in ipairs(attrs.tags) do
            table.insert(tags, tag)
        end
        for _, tag in ipairs(data.tags) do
            table.insert(tags, tag)
        end
    end
    
    local msg = {
        id = idCounter,
        senderId = attrs.senderId,
        sender = attrs.sender,
        message = messageContent,
        picture = attrs.picture,
        channel = { id = data.channel.id, name = data.channel.name },
        tags = tags,
        color = attrs.color
    }

    self.channels[data.channel.name].messages[idCounter] = msg

    TriggerClientEvent('senor-chat:client:newMessage', -1, msg)

    return msg
end

function Chat:GetChannelByName(name)
    local channelName = self.lookupChannels[name]
    if channelName then
        return self.channels[channelName]
    end

    return self.channels[name] or false
end

function Chat:GetChannelById(id)
    local channelName = self.lookupChannels[id]
    if channelName then
        return self.channels[channelName]
    end
    return false
end

function Chat:GetChannelNameById(id)
    return self.lookupChannels[id] or nil
end

function Chat:AddChannel(channelName, channelId, timeout)
    if self.channels[channelName] then return false end

    local id = channelId or math.random(0, 300) + math.random(0, 300) + os.time()
    local channelTimeout = timeout or 5

    local template = createChannelTemplate(nil, id, channelName, channelTimeout)

    self.channels[channelName] = template
    self.lookupChannels[id] = channelName

    return true
end

function Chat:GetChannels()
    return self.channels
end

function Chat:GetRandomChannels(amount)
    local stored = {}
    local counter = 0

    for k, v in pairs(self.channels) do
        if counter > amount then return stored end
        stored[#stored + 1] = v

        counter = counter + 1
    end

    return stored
end

function Chat:getInstance()
    return self.instance
end

function Chat:deleteMessage(messageId, messageChannel, adminId)
    local ch = self:GetChannelByName(messageChannel)
    if not ch or ch.name == 'Staff' then
        return
    end

    local msg = ch.messages[messageId]
    if not msg then
        return
    end

    ch.messages[messageId] = nil

    if adminId then
        local staff = self:GetChannelByName("Staff")
        if staff then
            self:StaffMessage({
                message = locale('message_staff_deleted', GetPlayerName(adminId), adminId, messageId, msg.sender or locale('message_unknown_sender'), msg.senderId or 0, msg.message or locale('message_no_content')),
                channel = staff
            })
        end
    end

    TriggerClientEvent('senor-chat:client:deleteMessage', -1, { id = messageId, channel = { name = messageChannel, id = ch.id } })
end

function Chat:RemovePlayer(playerId)
    if self.players[playerId] then
        self.players[playerId] = nil
    end
end

function Chat:ClearChannel(channelName, adminId)
    local ch = self:GetChannelByName(channelName)
    if not ch or ch.name == 'Staff' then return false end
    
    ch.messages = {}
    
    if adminId then
        local staff = self:GetChannelByName("Staff")
        if staff then
            self:StaffMessage({
                message = locale('message_staff_cleared_channel', GetPlayerName(adminId), adminId, channelName),
                channel = staff
            })
        end
    end
    
    TriggerClientEvent('senor-chat:client:clearChannel', -1, { channel = channelName })
    return true
end

---@diagnostic disable-next-line: lowercase-global, undefined-doc-name
chat = Chat:new()
