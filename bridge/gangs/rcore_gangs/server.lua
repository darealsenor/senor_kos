local gang = {}

---@param gangKey string|nil
---@param gangLabel string|nil
---@return table|nil
local function normalizeGang(gangKey, gangLabel)
    if not gangKey or gangKey == '' then
        return nil
    end
    local key = tostring(gangKey)
    local label = tostring(gangLabel or gangKey)
    if Shared.IsGangBlacklisted(key, label) then
        return nil
    end
    return {
        name = key,
        label = label,
    }
end

---@return table<string, table>
function gang.GetGangs()
    local rows = MySQL.query.await('SELECT `tag`, `name` FROM `gangs`') or {}
    local out = {}
    for i = 1, #rows do
        local row = rows[i]
        local key = row and (row.tag or row.name) or nil
        local label = row and (row.name or row.tag) or key
        local normalized = normalizeGang(key, label)
        if normalized then
            out[normalized.name] = {
                name = normalized.name,
                label = normalized.label,
                grades = {
                    [0] = {
                        name = 'Member',
                        level = 0,
                        grade = 0,
                        isboss = false,
                        bankAuth = false,
                    }
                }
            }
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
    local found = gang.GetGangs()[gangName]
    local gangLabel = (found and (found.label or found.name)) or gangName
    return normalizeGang(gangName, gangLabel)
end

---@param playerId number
---@return table|nil
function gang.GetPlayerGang(playerId)
    local playerGang = exports['rcore_gangs']:GetPlayerGang(playerId)
    if not playerGang then
        return nil
    end
    return normalizeGang(playerGang.tag or playerGang.name, playerGang.name or playerGang.tag)
end

return gang
