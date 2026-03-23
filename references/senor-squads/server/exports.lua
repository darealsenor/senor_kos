---@param identifier number | string
---@return table
function GetSquadExport(identifier)
    local squadInstance = nil
    
    if type(identifier) == "number" then
        -- First check if it's a player ID
        local playerResult = GetPlayer(identifier)
        if playerResult.success then
            local squadResult = GetPlayerSquad(identifier)
            if squadResult.success then
                squadInstance = squadResult.squad
            end
        end
        
        -- If not found as player ID, try as squad ID
        if not squadInstance then
            local squadResult = GetSquad(identifier)
            if squadResult.success then
                squadInstance = squadResult.squad
            end
        end
    elseif type(identifier) == "string" then
        -- Try as squad name
        local squadResult = GetSquadByName(identifier)
        if squadResult.success then
            squadInstance = squadResult.data
        end
    end
    
    if squadInstance then
        return {
            success = true,
            message = 'Squad Found',
            data = squadInstance:GetSquadData()
        }
    end
    
    return { success = false, message = 'Squad not found', data = nil }
end

---@return table
function GetSquads()
    local sanitized = {}
    for k, v in pairs(Squads) do
        if type(v) == "table" then
            local tbl = lib.table.deepclone(v:GetSquadData())
            tbl.privacy = v.password ~= nil
            sanitized[#sanitized + 1] = tbl
        end
    end
    return sanitized
end

---@param data table
---@return table
function CreateSquad(data)
    local result = { success = false, message = nil, data = nil }

    if type(data.playerId) ~= "number" then
        return { success = false, message = "Player ID is not a number" }
    end

    if type(data.name) ~= "string" or #data.name < 1 or #data.name > 24 then
        return { success = false, message = "Name must be a string with 1 to 24 characters" }
    end

    if data.image ~= nil and type(data.image) ~= "string" then
        return { success = false, message = "Image is not a string" }
    end

    local maxSize = (type(Shared.MaximumSquadPlayers) == "number" and Shared.MaximumSquadPlayers > 0) and Shared.MaximumSquadPlayers or 4
    data.maxplayers = math.min(math.max(tonumber(data.maxplayers) or 4, 2), maxSize)

    local player_check = GetPlayer(data.playerId)
    if player_check and player_check.success then
        return { success = false, message = "Player is already in a squad" }
    end

    local newSquad = SquadClass:new(data)
    if not newSquad.success then
        return newSquad
    end

    return {
        success = true,
        message = 'Squad Created',
        data = newSquad.data:GetSquadData()
    }
end

---@param playerId number
---@param squadId number | string
---@return table
function AddPlayerToSquad(playerId, squadId)
    local playerCheck = GetPlayer(playerId)
    if playerCheck.success then
        return { success = false, message = "Player is already in a squad" }
    end

    -- Get the squad instance
    local squadInstance = nil
    if type(squadId) == "number" then
        -- Try as squad ID
        local result = GetSquad(squadId)
        if result.success then
            squadInstance = result.squad
        end
    elseif type(squadId) == "string" then
        -- Try as squad name
        local result = GetSquadByName(squadId)
        if result.success then
            squadInstance = result.data
        end
    end

    if not squadInstance then
        return { success = false, message = "Squad not found" }
    end

    local addResult = squadInstance:AddPlayer(playerId, false, nil)
    return addResult
end

---@param playerId number
---@return table
function RemovePlayerFromSquad(playerId)
    local squadResult = GetPlayerSquad(playerId)
    if not squadResult.success then
        return { success = false, message = "Player is not in a squad" }
    end

    local removeResult = squadResult.squad:RemovePlayer(playerId, true, nil)
    return removeResult
end

---@param playerId number
---@return boolean
function IsPlayerInSquad(playerId)
    local result = GetPlayerSquad(playerId)
    return result.success
end

---@param playerId number
---@return number|string|nil squad id or nil if not in a squad
function GetSquadIdForPlayer(playerId)
    local result = GetPlayer(playerId)
    if not result.success then return nil end
    return result.player
end

---@param playerId number
---@param data table
---@return table
function EditSquad(playerId, data)
    local squadResult = GetPlayerSquad(playerId)
    if not squadResult.success then
        return { success = false, message = "Player is not in a squad" }
    end

    if not squadResult.squad:IsOwner(playerId) then
        return { success = false, message = "Player is not the owner of this squad" }
    end

    -- Update squad data
    if data.name then
        squadResult.squad.name = data.name
    end
    if data.image ~= nil then
        if not data.image or data.image == '' or data.image == Shared.FallbackImage then
            squadResult.squad.image = squadResult.squad.players[playerId] and squadResult.squad.players[playerId].image or Shared.FallbackImage
        else
            squadResult.squad.image = data.image
        end
    end
    if data.maxplayers then
        local maxSize = (type(Shared.MaximumSquadPlayers) == "number" and Shared.MaximumSquadPlayers > 0) and Shared.MaximumSquadPlayers or 4
        local minMembers = squadResult.squad.playersLength or 0
        squadResult.squad.maxplayers = math.min(math.max(tonumber(data.maxplayers) or 4, minMembers), maxSize)
    end
    if data.password ~= nil then
        squadResult.squad.password = data.password
    end

    -- Broadcast the update to all squad members
    squadResult.squad:UpdateSquad()

    local squadData = squadResult.squad:GetSquadData()
    TriggerEvent('squads:server:squadEdited', squadResult.squad.squadId, playerId, squadData)

    return {
        success = true,
        data = squadData,
        message = 'Squad updated successfully'
    }
end

exports('GetSquad', GetSquadExport)
exports('GetSquads', GetSquads)
exports('CreateSquad', CreateSquad)
exports('AddPlayer', AddPlayerToSquad)
exports('RemovePlayer', RemovePlayerFromSquad)
exports('IsPlayerInSquad', IsPlayerInSquad)
exports('GetSquadIdForPlayer', GetSquadIdForPlayer)
exports('EditSquad', EditSquad)
