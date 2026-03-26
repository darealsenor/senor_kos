local gang = {}

---@return table<string, table>
function gang.GetGangs()
    local raw = exports.qbx_core:GetGangs() or {}
    local out = {}
    for key, value in pairs(raw) do
        local gangKey = tostring(key)
        local gangLabel = (value and (value.label or value.name)) or gangKey
        if not Shared.IsGangBlacklisted(gangKey, gangLabel) then
            out[gangKey] = value
        end
    end
    return out
end

---@param gangName string|nil
---@return table|nil
function gang.GetGangByName(gangName)
    if not gangName then
        return nil
    end
    local gangs = gang.GetGangs() or {}
    local found = gangs[gangName]
    local gangLabel = (found and (found.label or found.name)) or gangName
    if Shared.IsGangBlacklisted(gangName, gangLabel) then
        return nil
    end
    return {
        name = gangName,
        label = gangLabel,
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
    local gangName = tostring(gangData.name)
    local gangLabel = tostring(gangData.label or gangData.name)
    if Shared.IsGangBlacklisted(gangName, gangLabel) then
        return nil
    end
    return {
        name = gangName,
        label = gangLabel,
    }
end

return gang
