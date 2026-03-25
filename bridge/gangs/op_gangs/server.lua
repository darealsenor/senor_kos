local gang = {}

---@return table<string, table>
function gang.GetGangs()
    local opGangs = exports['op-crime']:getOrganisationsList() or {}
    local gangs = {}
    for _, org in pairs(opGangs) do
        if org and org.name then
            gangs[org.name] = {
                name = org.name,
                label = org.label or org.name,
                grades = {
                    [0] = {
                        name = 'Member',
                        level = 0,
                        grade = 0,
                        isboss = false,
                        bankAuth = false
                    }
                }
            }
        end
    end
    return gangs
end

---@param gangName string|nil
---@return table|nil
function gang.GetGangByName(gangName)
    if not gangName then
        return nil
    end
    local found = gang.GetGangs()[gangName]
    if not found then
        return {
            name = gangName,
            label = gangName,
        }
    end
    return {
        name = gangName,
        label = found.label or found.name or gangName,
    }
end

---@param playerId number
---@return table|nil
function gang.GetPlayerGang(playerId)
    local player = exports['op-crime']:getPlayerOrganisation(playerId)
    if not player or not player.orgData or not player.orgData.name then
        return nil
    end
    return gang.GetGangByName(player.orgData.name)
end
return gang
