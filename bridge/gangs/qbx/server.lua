local gang = {}

---@return table<string, table>
function gang.GetGangs()
    return exports.qbx_core:GetGangs()
end

---@param gangName string|nil
---@return table|nil
function gang.GetGangByName(gangName)
    if not gangName then
        return nil
    end
    local gangs = gang.GetGangs() or {}
    local found = gangs[gangName]
    return {
        name = gangName,
        label = (found and (found.label or found.name)) or gangName,
    }
end

---@param playerId number
---@return table|nil
function gang.GetPlayerGang(playerId)
    local player = exports.qbx_core:GetPlayer(playerId)
    if not player then
        return nil
    end
    local gangData = player.PlayerData and player.PlayerData.gang
    if not gangData or not gangData.name then
        return nil
    end
    return {
        name = tostring(gangData.name),
        label = tostring(gangData.label or gangData.name),
    }
end

return gang