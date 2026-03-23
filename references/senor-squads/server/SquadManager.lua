-- if GetCurrentResourceName() ~= "senor-squads" then
--     for i = 1, 100 do
--         print(('^1[senor-squads] ^2WARNING: ^1Resource name should be ^3senor-squads^1, not ^3%s'):format(GetCurrentResourceName()))
--         print('^1[senor-squads] ^2WARNING: ^1SCRIPT WILL NOT WORK UNTIL YOU FIX THIS ISSUE')
--         Wait(3000)
--     end
-- end



Squads = {}
SquadsName = {}
Players = {}

---@type table<number, string> serverId → stable identifier (citizenid / license)
PlayerIdentifiers = {}

---@param playerId number
---@return string
function GetPlayerIdentifier(playerId)
    return PlayerIdentifiers[playerId] or Bridge.F:GetPlayerIdentifier(playerId)
end

---@param squadId string
---@param name string
---@param image string
---@param password string | nil
---@param maxplayers number
---@param ownerIdentifier string
function Persist_SaveSquad(squadId, name, image, password, maxplayers, ownerIdentifier)
    if not ServerConfig.PersistentSquads then return end
    DB_SaveSquad(squadId, name, image, password, maxplayers, ownerIdentifier)
end

---@param squadId string
function Persist_DeleteSquad(squadId)
    if not ServerConfig.PersistentSquads then return end
    DB_DeleteSquad(squadId)
end

---@param squadId string
---@param identifier string
---@param isOwner boolean
---@param name string | nil
---@param image string | nil
function Persist_SaveMember(squadId, identifier, isOwner, name, image)
    if not ServerConfig.PersistentSquads then return end
    DB_SaveMember(squadId, identifier, isOwner, name, image)
end

---@param squadId string
---@param identifier string
function Persist_RemoveMember(squadId, identifier)
    if not ServerConfig.PersistentSquads then return end
    DB_RemoveMember(squadId, identifier)
end

---@param squadId string
function Persist_Touch(squadId)
    if not ServerConfig.PersistentSquads then return end
    DB_TouchSquad(squadId)
end

---@alias SquadResult { success: boolean, message: string, squad?: table, player?: table, counter?: number }

---@param playerId number
---@return SquadResult
function GetPlayerSquad(playerId)
    local target = Squads[GetPlayer(playerId).player]
    if not target then
        return { success = false, message = 'Player does not belong in any squad' }
    end
    return { success = true, squad = target, message = 'Squad Found' }
end

---@param squadId number
---@return SquadResult
function GetSquad(squadId)
    local target = Squads[squadId]
    if not target then
        return { success = false, message = 'Squad not found' }
    end
    return { success = true, squad = target, message = 'Squad Found' }
end

---@param playerId number
---@return SquadResult
function GetPlayer(playerId)
    local target = Players[playerId]
    if not target then
        return { success = false, message = 'Player not found' }
    end
    return { success = true, player = target, message = 'Player Found' }
end

---@param playerId number
---@param squadId number | string
---@param addToInstance boolean
---@return SquadResult
function AddPlayer(playerId, squadId, addToInstance)
    lib.print.debug(playerId)
    if GetPlayer(playerId).success then
        return { success = false, message = "Player is already in a squad" }
    end

    if addToInstance then
        local squadInstance = GetSquad(squadId)
        if squadInstance.success then
            squadInstance.squad:AddPlayer(playerId)
        end
    end
    Players[playerId] = squadId
    return { success = true, message = ("Player %d added to squad %d"):format(playerId, squadId) }
end

---@param playerId number
---@return SquadResult
function RemovePlayer(playerId)
    if not GetPlayer(playerId).success then
        return { success = false, message = "Player is not in a squad" }
    end
    Players[playerId] = nil
    TriggerClientEvent('squad:client:SquadRemoved', playerId)
    return { success = true, message = ("Player %d removed from squad"):format(playerId) }
end

function GetSquadByName(gangName)
    if not SquadsName[gangName] then return { success = false, message = 'Squad not found', data = nil } end

    return { success = true, message = 'Squad Found', data = Squads[SquadsName[gangName]] }
end
