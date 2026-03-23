local channels = {}
local currentChannelId = nil

local function addChannel(channel, add, focus)
    if add then
        channels[channel.id] = channel
    end
    SendReactMessage('addChannel', channel)

    if focus then
        SendReactMessage('setChannel', channel.id)
    end
end

local function removeChannel(channel)
    SendReactMessage('removeChannel', channel)
end

RegisterNetEvent('senor-chat:client:addChannel')
AddEventHandler('senor-chat:client:addChannel', addChannel)

RegisterNetEvent('senor-chat:client:removeChannel')
AddEventHandler('senor-chat:client:removeChannel', removeChannel)

RegisterNetEvent('senor-chat:client:loadChannels')
AddEventHandler('senor-chat:client:loadChannels', function(channelsArray)
    channels = {}
    
    for _, channel in ipairs(channelsArray) do
        channels[channel.id] = channel
        SendReactMessage('addChannel', channel)
    end
    
    if #channelsArray > 0 then
        SendReactMessage('setChannel', channelsArray[1].id)
    end
end)

RegisterNUICallback('setChannel', function(data, cb)
    lib.print.info(data)
    if data and type(data) == 'number' then
        currentChannelId = data
    end
    cb(1)
end)

lib.callback.register('senor-chat:client:GetCurrentChannel', function()
    return GetCurrentChannelId()
end)

function GetCurrentChannelId()
    return currentChannelId
end

function ValidateChannel(channelId)
    if type(channelId) == 'table' and channelId.id then
        return channels[channelId.id] ~= nil
    end
    return channels[channelId] ~= nil
end

--[[
-- Bucket channel logic (commented out for future use)
local function addBucketChannel(bucket)
    local name = ('Bucket - %d'):format(bucket)
    channels[name] = {name = ('Bucket - %d'):format(bucket), id = bucket, bucket = true}
    addChannel(channels[name], true)
end

local function removeBucketChannels()
    if next(channels) then
        for k, v in pairs(channels) do
            if v.bucket then
                removeChannel(v.id)
            end
        end
    end
end

AddStateBagChangeHandler('bucket', ('player:%s'):format(cache.serverId), function(_, _, value)
    if value == 0 then
        removeBucketChannels()
    else
        removeBucketChannels()
        addBucketChannel(value)
    end
end)
--]]

--[[
-- LFW channel logic (commented out for future use)
RegisterPlayerLoadedCallback(function(playerData)
    if playerData and playerData.lfw then
        addChannel({
            id = 2,
            name = 'LFW',
        }, true)
    end
end)
--]]
