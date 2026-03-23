---@return table | nil
function GetSquad()
    if not Squad.mySquad then return nil end
    return Squad.mySquad
end

---@return boolean
function IsInSquad()
    return Squad.mySquad ~= nil
end

---@return nil
function OpenMenu()
    TriggerEvent('squads:client:openMenu')
end

---@param playerId number
---@return boolean
function IsPlayerInMySquad(playerId)
    if not Squad.mySquad or not Squad.mySquad.players then return false end
    return Squad.mySquad.players[playerId] ~= nil
end

---@return table | nil
function GetSquadPlayers()
    if not Squad.mySquad or not Squad.mySquad.players then return nil end
    local players = {}
    for playerId, playerData in pairs(Squad.mySquad.players) do
        players[#players + 1] = playerData
    end
    return players
end

---@param setting string
---@return boolean
function IsSettingEnabled(setting)
    if not Squad.Settings then return false end
    
    if setting == "relations" then
        return Config.Settings['Relations'] == true
    elseif setting == "blips" then
        return Squad.Settings.Blips and Squad.Settings.Blips.enabled == true
    elseif setting == "tags" then
        return Squad.Settings.Tags == true
    elseif setting == "hud" then
        return Squad.Settings.Hud == true
    end
    
    return false
end

---@return number | nil
function GetSquadOwner()
    if not Squad.mySquad then return nil end
    return Squad.mySquad.owner
end

---@return number | nil
function GetRelationsGroupHash()
    if not Squad.mySquad or not Squad.mySquad.id then return nil end
    local _, relationship = AddRelationshipGroup(Squad.mySquad.id)
    return relationship
end

exports('GetSquad', GetSquad)
exports('IsInSquad', IsInSquad)
exports('OpenMenu', OpenMenu)
exports('IsPlayerInMySquad', IsPlayerInMySquad)
exports('GetSquadPlayers', GetSquadPlayers)
exports('IsSettingEnabled', IsSettingEnabled)
exports('GetSquadOwner', GetSquadOwner)
exports('GetRelationsGroupHash', GetRelationsGroupHash)

