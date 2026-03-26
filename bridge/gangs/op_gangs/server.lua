local gang = {}

---@return table<string, table>
function gang.GetGangs()
    local opGangs = exports['op-crime']:getOrganisationsList() or {}
    local gangs = {}
    for _, org in pairs(opGangs) do
        if org and org.name then
            local gangName = tostring(org.name)
            local gangLabel = tostring(org.label or org.name)
            if not Shared.IsGangBlacklisted(gangName, gangLabel) then
                gangs[gangName] = {
                    name = gangName,
                    label = gangLabel,
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
    local gangLabel = (found and (found.label or found.name)) or gangName
    if Shared.IsGangBlacklisted(gangName, gangLabel) then
        return nil
    end
    if not found then
        return {
            name = gangName,
            label = gangLabel,
        }
    end
    return {
        name = gangName,
        label = gangLabel,
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
