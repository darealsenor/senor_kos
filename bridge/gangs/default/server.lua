local gang = {}

---@return table
function gang.GetGangs()
    return {}
end

---@param _playerId number
---@return table|nil
function gang.GetPlayerGang(_playerId)
    return nil
end

---@param gangName string|nil
---@return table|nil
function gang.GetGangByName(gangName)
    if not gangName then
        return nil
    end
    return {
        name = gangName,
        label = gangName,
    }
end

return gang
