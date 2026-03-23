---@param playerId number
---@param data table
lib.callback.register('squads:server:CreateSquad', function(playerId, data)
    data.playerId = playerId
    local newSquad = CreateSquad(data)
    lib.print.debug(newSquad)
    if not newSquad.success then return newSquad end
    return {
        success = true,
        message = 'Squad Created',
        data = {
            players = newSquad.data.players,
            name = newSquad.data.name,
            image = newSquad.data.image,
            maxplayers = newSquad.data.maxplayers,
            playersLength = newSquad.data.playersLength,
            messages = {}
        }
    }
end)

---@param playerId number
---@param target number
---@return string
lib.callback.register('squads:server:RemovePlayer', function(playerId, target)
    local squadInstance = GetPlayerSquad(playerId)
    if not squadInstance.success then
        return squadInstance.message
    end

    local remove = squadInstance.squad:RemovePlayer(target, false, playerId)
    return remove.message
end)

---@param playerId number
---@param data table
lib.callback.register('squads:server:JoinSquad', function(playerId, data)
    local squadInstance = GetSquad(data.squad)
    if not squadInstance.success then
        return squadInstance
    end

    lib.print.debug(squadInstance)

    local join = squadInstance.squad:AddPlayer(playerId, false, data.password)
    return join
end)

---@param playerId  number
---@return table
lib.callback.register('squads:server:GetSquads', function(playerId)
    local sanitized = {}
    for k, v in pairs(Squads) do
        if type(v) == "table" then
            local tbl = lib.table.deepclone(v)
            tbl.privacy = v.password ~= nil
            tbl.password = nil
            sanitized[#sanitized + 1] = tbl
        end
    end
    return sanitized
end)

---@param playerId number
---@param targetIdOrIdentifier number|string online player server id or offline member identifier
---@return SquadResult
lib.callback.register('squads:server:RemovePlayer', function(playerId, targetIdOrIdentifier)
    local squadInstance = GetPlayerSquad(playerId)
    if not squadInstance.success then return squadInstance end

    if type(targetIdOrIdentifier) == 'string' then
        return squadInstance.squad:RemoveMemberByIdentifier(targetIdOrIdentifier, playerId)
    end
    return squadInstance.squad:RemovePlayer(targetIdOrIdentifier, false, playerId)
end)

lib.callback.register('squads:server:SendMessage', function(playerId, content)
    local squadInstance = GetPlayerSquad(playerId)
    if not squadInstance.success then return squadInstance end

    local result = squadInstance.squad:Message(playerId, content)
    return result
end)

local function leaveSquad(playerId)
    local squadInstance = GetPlayerSquad(playerId)
    if not squadInstance.success then return squadInstance end

    local result = squadInstance.squad:RemovePlayer(playerId, true, nil)
    return result
end

lib.callback.register('squads:server:LeaveSquad', leaveSquad)
AddEventHandler('squads:server:playerDropped', leaveSquad)

RegisterNetEvent('squad:server:SetPlayerDeathState', function(isDead)
    local playerId = source
    local squadInstance = GetPlayerSquad(playerId)
    if not squadInstance.success then return end
    if not squadInstance.squad.players[playerId] then return end
    squadInstance.squad.players[playerId].isDead = isDead
    squadInstance.squad:Emit('squad:client:SquadUpdateAttributes', squadInstance.squad:GetSquadData())
end)

lib.callback.register('isNameValid', function(playerId, squadName)
    return not GetSquadByName(squadName).success
end)

lib.callback.register('squads:server:EditSquad', function(playerId, data)
    local squadInstance = GetPlayerSquad(playerId)
    if not squadInstance.success then
        return { success = false, message = 'No squad found' }
    end

    if not squadInstance.squad:IsOwner(playerId) then
        return { success = false, message = 'You are not the owner of this squad' }
    end

    -- Update squad data
    squadInstance.squad.name = data.name
    if not data.image or data.image == '' or data.image == Shared.FallbackImage then
        squadInstance.squad.image = squadInstance.squad.players[playerId] and squadInstance.squad.players[playerId].image or Shared.FallbackImage
    else
        squadInstance.squad.image = data.image
    end
    local maxSize = (type(Shared.MaximumSquadPlayers) == "number" and Shared.MaximumSquadPlayers > 0) and Shared.MaximumSquadPlayers or 4
    local minMembers = squadInstance.squad.playersLength or 0
    squadInstance.squad.maxplayers = math.min(math.max(tonumber(data.maxplayers) or 4, minMembers), maxSize)
    squadInstance.squad.password = data.password

    -- Broadcast the update to all squad members
    squadInstance.squad:UpdateSquad()

    local ownerIdentifier = GetPlayerIdentifier(squadInstance.squad.playerId)
    Persist_SaveSquad(
        squadInstance.squad.squadId,
        squadInstance.squad.name,
        squadInstance.squad.image,
        squadInstance.squad.password,
        squadInstance.squad.maxplayers,
        ownerIdentifier
    )

    local squadData = squadInstance.squad:GetSquadData()
    TriggerEvent('squads:server:squadEdited', squadInstance.squad.squadId, playerId, squadData)

    return { 
        success = true, 
        data = squadData,
        message = 'Squad updated successfully'
    }
end)

lib.callback.register('squads:server:GetProfilePicture', function(playerId)
    return GetProfilePicture(playerId)
end)

lib.callback.register('squads:server:TransferOwnership', function(playerId, targetId)
    local squadInstance = GetPlayerSquad(playerId)
    if not squadInstance.success then return { success = false, message = 'Not in a squad' } end
    return squadInstance.squad:TransferOwnership(playerId, targetId)
end)

lib.callback.register('squads:server:ForceCloseSquad', function(playerId)
    local squadInstance = GetPlayerSquad(playerId)
    if not squadInstance.success then
        return { success = false, message = 'Not in a squad' }
    end
    if not squadInstance.squad:IsOwner(playerId) then
        return { success = false, message = 'You are not the owner of this squad' }
    end
    local squad = squadInstance.squad
    local membersToNotify = {}
    for pid, _ in pairs(squad.players) do
        membersToNotify[#membersToNotify + 1] = pid
    end
    for _, pid in ipairs(membersToNotify) do
        RemovePlayer(pid)
    end
    squad:RemoveSquad()
    return { success = true }
end)

---@param playerId number
---@param preloadedIdentifier string | nil
local function onPlayerLoaded(playerId, preloadedIdentifier)
    if not ServerConfig.PersistentSquads then return end

    local identifier = preloadedIdentifier or Bridge.F:GetPlayerIdentifier(playerId)
    PlayerIdentifiers[playerId] = identifier

    for _, squad in pairs(Squads) do
        if type(squad) == 'table' and squad.pendingMembers and squad.pendingMembers[identifier] then
            local memberData = squad.pendingMembers[identifier]
            squad.pendingMembers[identifier] = nil

            local isOwner = memberData.isOwner
            if isOwner then
                squad.playerId = playerId
            end

            local attrResult = squad:GetPlayerAttributes(playerId)
            if attrResult.success then
                attrResult.player.owner = isOwner
                squad.players[playerId] = attrResult.player
                AddPlayer(playerId, squad.squadId, false)
                squad.playersLength = squad.playersLength + 1

                local ownerIdentifier = PlayerIdentifiers[squad.playerId] or Bridge.F:GetPlayerIdentifier(squad.playerId)
                local p = squad.players[playerId]
                Persist_SaveSquad(squad.squadId, squad.name, squad.image, squad.password, squad.maxplayers, ownerIdentifier)
                Persist_SaveMember(squad.squadId, identifier, isOwner, p and p.name, p and p.image)

                TriggerClientEvent('squad:client:SquadUpdate', playerId, squad:GetSquadData())
            end
            return
        end
    end
end

AddEventHandler('squads:server:playerLoaded', onPlayerLoaded)

local pingLastAt = {}

RegisterNetEvent('squad:server:Ping')
AddEventHandler('squad:server:Ping', function(pingType, coords, entityNetId)
    local src = source
    local now = GetGameTimer()
    if pingLastAt[src] and (now - pingLastAt[src]) < ServerConfig.PingCooldownMs then return end
    pingLastAt[src] = now

    local squadInstance = GetPlayerSquad(src)
    if not squadInstance.success then return end

    local squad = squadInstance.squad
    local senderName = squad.players[src] and squad.players[src].name or 'Unknown'

    for playerId in pairs(squad.players) do
        TriggerClientEvent('squad:client:PingReceived', playerId, {
            type        = pingType,
            coords      = coords,
            senderId    = src,
            senderName  = senderName,
            entityNetId = entityNetId,
        })
    end
end)

AddEventHandler('playerDropped', function()
    local src = source
    pingLastAt[src] = nil
    leaveSquad(src)
end)

AddEventHandler('onResourceStart', function(resourceName)
    if resourceName ~= GetCurrentResourceName() then return end
    if not ServerConfig.PersistentSquads then return end

    DB_Init(function()
        if ServerConfig.SquadExpiryDays and ServerConfig.SquadExpiryDays > 0 then
            DB_PurgeExpiredSquads(ServerConfig.SquadExpiryDays)
        end

        DB_LoadAllSquads(function(rows)
            for _, row in ipairs(rows) do
                local squadData = row.squad
                local members = row.members

                SquadClass:new({
                    squadId = squadData.id,
                    playerId = 0,
                    name = squadData.name,
                    image = squadData.image,
                    password = (squadData.password and squadData.password ~= '') and squadData.password or nil,
                    maxplayers = squadData.maxplayers,
                    fromDB = true,
                })

                local instance = Squads[squadData.id]
                if instance then
                    instance.ownerIdentifier = squadData.owner_identifier
                    for _, member in ipairs(members) do
                        local isOwner = member.is_owner == 1 or member.is_owner == true
                        instance:RestoreMember(member.identifier, isOwner, member.name, member.image)
                    end
                end
            end

            lib.print.info(('[senor-squads] Loaded %d persistent squad(s) from database'):format(#rows))

            CreateThread(function()
                Wait(2000)
                local onlinePlayers = Bridge.F:GetAllPlayers()
                for _, entry in ipairs(onlinePlayers) do
                    onPlayerLoaded(entry.id, entry.identifier)
                end
            end)
        end)
    end)
end)
