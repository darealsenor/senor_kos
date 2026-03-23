SquadClass = lib.class('Squad')

---@class squadData
---@field squadId number a random generated squad ID for easier table lookup
---@field playerId number owner player identifier (source)
---@field name string Name of the squad
---@field image string Image of the squad
---@field password string optional password
---@field players table Player list that is in the squad
---@field maxplayers number optional maximum players or 4
---@field playersLength number

---@param data squadData Squad configuration data
---@return SquadResult
function SquadClass:constructor(data)
    self.squadId = data.squadId or (data.playerId .. os.time())
    self.playerId = data.playerId
    self.name = data.name
    self.players = {}
    local raw = data.maxplayers or 4
    local maxSize = (type(Shared.MaximumSquadPlayers) == "number" and Shared.MaximumSquadPlayers > 0) and Shared.MaximumSquadPlayers or 4
    self.maxplayers = math.min(math.max(tonumber(raw) or 4, 2), maxSize)
    self.password = data.password or nil
    self.playersLength = 0


    local result = self:AddSquad()
    if not result.success then
        return result
    end

    if not data.fromDB then
        local ownerIdentifier = GetPlayerIdentifier(data.playerId)
        self.image = (data.image and data.image ~= '' and data.image ~= Shared.FallbackImage) and data.image or Shared.FallbackImage
        Persist_SaveSquad(self.squadId, self.name, self.image, self.password, self.maxplayers, ownerIdentifier)

        local addPlayerResult = self:AddPlayer(data.playerId, true, "")
        if not addPlayerResult.success then
            return addPlayerResult
        end

        if self.players[data.playerId] and self.players[data.playerId].image ~= Shared.FallbackImage then
            self.image = self.players[data.playerId].image
            Persist_SaveSquad(self.squadId, self.name, self.image, self.password, self.maxplayers, ownerIdentifier)
        end
    else
        self.image = data.image or Shared.FallbackImage
    end

    CreateThread(function()
        while Squads[self.squadId] do
            Wait(1000)
            self:UpdatePlayerAttributes()
        end
    end)

    if not data.fromDB then
        TriggerEvent('squads:server:squadCreated', self.squadId, data.playerId, self:GetSquadData())
    end

    return { success = true, message = ("Squad '%s' created successfully!"):format(self.name) }
end

---@param identifier string stable player identifier
---@param isOwner boolean
---@param name string | nil
---@param image string | nil
function SquadClass:RestoreMember(identifier, isOwner, name, image)
    self.ownerIdentifier = isOwner and identifier or self.ownerIdentifier
    if not self.pendingMembers then self.pendingMembers = {} end
    self.pendingMembers[identifier] = { isOwner = isOwner, name = name or identifier, image = image or '' }
end

---@param identifier string stable player identifier (offline member)
---@param initiator number server id of player requesting the remove (must be owner)
---@return SquadResult
function SquadClass:RemoveMemberByIdentifier(identifier, initiator)
    if initiator ~= self.playerId then
        return { success = false, message = 'You are not the owner' }
    end
    if not self.pendingMembers or not self.pendingMembers[identifier] then
        return { success = false, message = 'Player is not in the squad' }
    end

    self.pendingMembers[identifier] = nil
    if identifier == self.ownerIdentifier and self.playerId and self.playerId > 0 then
        self.ownerIdentifier = GetPlayerIdentifier(self.playerId)
        if ServerConfig.PersistentSquads then
            Persist_SaveSquad(self.squadId, self.name, self.image, self.password, self.maxplayers, self.ownerIdentifier)
        end
    end
    Persist_RemoveMember(self.squadId, identifier)
    Persist_Touch(self.squadId)
    self:UpdateSquad()
    return { success = true, message = 'Member removed from squad' }
end

---@param playerId number
---@return SquadResult
function SquadClass:GetPlayerAttributes(playerId)
    local QBPlayer = Bridge.F:GetPlayer(playerId)
    local player = {
        name = ServerConfig.NameOptions.DefaultName == ServerConfig.NameOptions.Types.IC and
        Bridge.F:GetPlayerName(playerId) or GetPlayerName(playerId),
        serverId = playerId,
        owner = self.playerId == playerId,
        image = GetProfilePicture(playerId),
        entity = GetPlayerPed(playerId),
        network = NetworkGetNetworkIdFromEntity(GetPlayerPed(playerId)),
    }

    player.health = GetEntityHealth(player.entity) / 2
    player.armor = GetPedArmour(player.entity)
    player.coords = GetEntityCoords(player.entity)
    player.isDead = false

    return { success = true, player = player, message = 'Player attributes retrieved' }
end

function SquadClass:UpdatePlayerAttributes()
    for k, player in pairs(self.players) do
        player.entity = GetPlayerPed(player.serverId)
        player.health = GetEntityHealth(player.entity) / 2
        player.armor = GetPedArmour(player.entity)
        player.coords = GetEntityCoords(player.entity)
    end

    self:Emit('squad:client:SquadUpdateAttributes', self:GetSquadData())
end

---@param playerId number
---@param ignorePassword boolean
---@param password string
---@return SquadResult
function SquadClass:AddPlayer(playerId, ignorePassword, password)
    if self:IsPlayerInSquad(playerId).success then
        return { success = false, message = 'Player is already in this squad' }
    end

    if not ignorePassword and password ~= self.password then
        return { success = false, message = "Incorrect password" }
    end

    local attributesResult = self:GetPlayerAttributes(playerId)
    if not attributesResult.success then
        return attributesResult
    end

    self.players[playerId] = attributesResult.player
    local addResult = AddPlayer(playerId, self.squadId, false)
    if not addResult.success then
        return addResult
    end

    self.playersLength = self.playersLength + 1

    local identifier = GetPlayerIdentifier(playerId)
    PlayerIdentifiers[playerId] = identifier

    local isOwner
    if ServerConfig.PersistentSquads and self.ownerIdentifier then
        isOwner = (identifier == self.ownerIdentifier)
        if isOwner then
            self.playerId = playerId
        end
    else
        local hasValidOwner = self.playerId and self.playerId > 0 and self.players[self.playerId]
        if not hasValidOwner then
            self.playerId = playerId
            isOwner = true
        else
            isOwner = (self.playerId == playerId)
        end
    end
    self.players[playerId].owner = isOwner

    local p = self.players[playerId]
    Persist_SaveMember(self.squadId, identifier, isOwner, p and p.name, p and p.image)
    Persist_Touch(self.squadId)

    if isOwner and ServerConfig.PersistentSquads then
        Persist_SaveSquad(self.squadId, self.name, self.image, self.password, self.maxplayers, identifier)
    end

    self:UpdateSquad()
    
    TriggerEvent('squads:server:playerJoined', playerId, self.squadId, self:GetSquadData())
    
    return { success = true, message = ('Player %d was added to squad %s (%d)'):format(playerId, self.name, self.squadId) }
end

---@param playerId number
---@param ignoreOwner boolean
---@param initiator number
---@return SquadResult
function SquadClass:RemovePlayer(playerId, ignoreOwner, initiator)
    if not self.players[playerId] then
        return { success = false, message = 'Player is not in the squad' }
    end
    if not ignoreOwner and initiator ~= self.playerId then
        return { success = false, message = 'You are not the owner' }
    end

    local identifier = PlayerIdentifiers[playerId] or GetPlayerIdentifier(playerId)
    local leavingPlayer = self.players[playerId]

    self.players[playerId] = nil
    local removeResult = RemovePlayer(playerId)
    if not removeResult.success then
        return removeResult
    end

    self.playersLength = self.playersLength - 1

    if self.playersLength == 0 and ServerConfig.PersistentSquads then
        self:RestoreMember(identifier, self.playerId == playerId, leavingPlayer and leavingPlayer.name, leavingPlayer and leavingPlayer.image)
        Persist_Touch(self.squadId)
        TriggerEvent('squads:server:playerLeft', playerId, self.squadId, nil)
        return { success = true, message = ('Player %d left, squad persisted empty'):format(playerId) }
    end

    Persist_RemoveMember(self.squadId, identifier)
    Persist_Touch(self.squadId)

    if self.playersLength == 0 then
        lib.print.debug('squad is empty, lets remove')
        local squadId = self.squadId
        local deleteResult = self:RemoveSquad()
        TriggerEvent('squads:server:playerLeft', playerId, squadId, nil)
        return deleteResult
    end

    local oldOwner = self.playerId
    if oldOwner == playerId and not ServerConfig.PersistentSquads and ServerConfig.AutoCloseSquadOnLeaderLeave then
        local squadId = self.squadId
        local membersToNotify = {}
        for pid, _ in pairs(self.players) do
            membersToNotify[#membersToNotify + 1] = pid
        end
        for _, pid in ipairs(membersToNotify) do
            RemovePlayer(pid)
        end
        local deleteResult = self:RemoveSquad()
        TriggerEvent('squads:server:playerLeft', playerId, squadId, nil)
        return deleteResult
    end

    if self.playerId == playerId and not ServerConfig.PersistentSquads then
        for k, v in pairs(self.players) do
            v.owner = true
            self.playerId = v.serverId
            lib.print.debug('New squad owner', k)
            break
        end
    end

    lib.print.debug(self:GetSquadData())
    self:UpdateSquad()

    TriggerEvent('squads:server:playerLeft', playerId, self.squadId, self:GetSquadData())
    
    if oldOwner ~= self.playerId then
        TriggerEvent('squads:server:squadOwnerChanged', self.squadId, oldOwner, self.playerId, self:GetSquadData())
    end

    return { success = true, message = ('Player %d was removed from squad: %s (%d)'):format(playerId, self.name,
        self.squadId) }
end

---@param playerId number
---@return SquadResult
function SquadClass:IsPlayerInSquad(playerId)
    if self.players[playerId] or GetPlayer(playerId).success then
        return { success = true, message = 'Player is in the squad' }
    end
    return { success = false, message = 'Player is not in the squad' }
end

---@return SquadResult
function SquadClass:AddSquad()
    Squads[self.squadId] = self
    Squads[self.name] = self.squadId
    SquadsName[self.name] = self.squadId
    return { success = true, message = ("Squad %s (%d) created"):format(self.name, self.squadId) }
end

---@return SquadResult
function SquadClass:RemoveSquad()
    local squadData = self:GetSquadData()
    Persist_DeleteSquad(self.squadId)
    self.pendingMembers = nil
    Squads[self.squadId] = nil
    Squads[self.name] = nil
    SquadsName[self.name] = nil
    TriggerEvent('squads:server:squadDeleted', self.squadId, squadData)
    return { success = true, message = "Squad removed" }
end

---@return SquadResult
function SquadClass:GetPlayers()
    local counter = 0
    for _, _ in pairs(self.players) do
        counter = counter + 1
    end
    return { success = true, counter = counter, players = self.players, message = 'Players retrieved' }
end

---@param playerId number
---@return SquadResult
function SquadClass:GetPlayer(playerId)
    if self.players[playerId] then
        return { success = true, message = 'Player Found', player = self.players[playerId] }
    end

    return { success = false, message = 'Player not found' }
end

---@return SquadResult
function SquadClass:UpdateSquad()
    CreateThread(function()
        self:Emit('squad:client:SquadUpdate', self:GetSquadData())
    end)
    return { success = true, message = 'Squad updated' }
end

function SquadClass:GetSquadData()
    return {
        players        = self.players,
        pendingMembers = self.pendingMembers or {},
        name           = self.name,
        image          = self.image,
        maxplayers     = self.maxplayers,
        id             = self.squadId,
        owner          = self.playerId
    }
end

---@param playerId number
---@return boolean
function SquadClass:IsOwner(playerId)
    return self.playerId == playerId
end

---@param event string
---@param ... any
---@return SquadResult
function SquadClass:Emit(event, ...)
    local payload = msgpack.pack_args(...)
    local payloadLen = #payload

    for playerId, _ in pairs(self.players) do
        TriggerClientEventInternal(event, playerId, payload, payloadLen)
    end
    return { success = true, message = 'Event emitted to squad members' }
end

---@param playerId number
---@param content string
---@return SquadResult
function SquadClass:Message(playerId, content)
    local player = self:GetPlayer(playerId)
    if not player.success then return player end

    local packedData = {
        message = content,
        time = os.time(),
        player = player.player
    }

    self:Emit('squad:client:NewMessage', packedData)
    
    TriggerEvent('squads:server:squadMessage', playerId, self.squadId, content, packedData)

    Persist_Touch(self.squadId)

    return { success = true, message = ('Your message: %s was sent'):format(content) }
end

---@param ownerId number current owner's server ID
---@param targetId number new owner's server ID
---@return SquadResult
function SquadClass:TransferOwnership(ownerId, targetId)
    if not self:IsOwner(ownerId) then
        return { success = false, message = 'You are not the owner' }
    end

    if not self.players[targetId] then
        return { success = false, message = 'Target player is not in the squad' }
    end

    if self.players[ownerId] then
        self.players[ownerId].owner = false
    end
    self.players[targetId].owner = true
    self.playerId = targetId

    local oldIdentifier = PlayerIdentifiers[ownerId] or GetPlayerIdentifier(ownerId)
    local newIdentifier = PlayerIdentifiers[targetId] or GetPlayerIdentifier(targetId)
    local oldPlayer     = self.players[ownerId]
    local newPlayer     = self.players[targetId]

    Persist_SaveMember(self.squadId, oldIdentifier, false, oldPlayer and oldPlayer.name, oldPlayer and oldPlayer.image)
    Persist_SaveMember(self.squadId, newIdentifier, true,  newPlayer and newPlayer.name, newPlayer and newPlayer.image)

    if ServerConfig.PersistentSquads then
        DB_SaveSquad(self.squadId, self.name, self.image, self.password, self.maxplayers, newIdentifier)
    end

    self:UpdateSquad()

    TriggerEvent('squads:server:squadOwnerChanged', self.squadId, ownerId, targetId, self:GetSquadData())

    return { success = true, message = ('Ownership transferred to player %d'):format(targetId) }
end

return SquadClass
