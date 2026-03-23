-- local function getPlayerGang(playerId)
--     local player = Bridge.framework.GetPlayer(playerId)
--     if not player then return nil end
    
--     if player.gang and player.gang.label and player.gang.label ~= 'No Gang' then
--         return player.gang.label
--     end
    
--     return nil
-- end

local function LoadPlayerChannels(playerId)
    local channels = {}
    
    local globalChannel = chat:GetChannelByName("Global")
    if globalChannel then
        local channelConfig = Config.Channels.default and Config.Channels.default[1] or {}
        table.insert(channels, {
            id = globalChannel.id,
            name = channelConfig.localeKey or "channel_global"
        })
    end
    
    if Config.Channels.enabled then
        if HasPermission(playerId, Permissions.ACCESS_STAFF_CHANNEL) then
            local staffChannel = chat:GetChannelByName("Staff")
            if staffChannel then
                local channelConfig = Config.Channels.default and Config.Channels.default[2] or {}
                table.insert(channels, {
                    id = staffChannel.id,
                    name = channelConfig.localeKey or "channel_staff"
                })
            end
        end
        
        -- local gangName = getPlayerGang(playerId)
        -- if gangName then
        --     local gangChannel = chat:GetChannelByName(gangName)
        --     if gangChannel then
        --         table.insert(channels, {
        --             id = gangChannel.id
        --         })
        --     end
        -- end
    end
    
    TriggerClientEvent('senor-chat:client:loadChannels', playerId, channels)
end

AddEventHandler('senor-chat:playerLoaded', function(playerId)
    Wait(1000)
    LoadPlayerChannels(playerId)
    
    local permissions = GetPlayerPermissions(playerId)
    TriggerClientEvent('senor-chat:client:playerPermissions', playerId, permissions)
end)

AddEventHandler('onServerResourceStart', function(resourceName)
    if resourceName == GetCurrentResourceName() then
        Wait(2000)
        
        for _, playerId in ipairs(GetPlayers()) do
            LoadPlayerChannels(tonumber(playerId))
        end
    end
end)

