local gang = {}

-- CREATE TABLE `organizations` (
--   `id` int(11) NOT NULL,
--   `name` varchar(100) NOT NULL,
--   `owner` varchar(100) NOT NULL,
--   `color` varchar(10) NOT NULL,
--   `zones` longtext NOT NULL,
--   `picture` varchar(2048) NOT NULL
-- ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ALTER TABLE `organizations`
--   ADD PRIMARY KEY (`id`);

-- ALTER TABLE `organizations`
--   MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
function gang.GetGangs()
    local query = MySQL.query.await('SELECT * FROM organizations')
    local gangs = {}
    if query then
        for _, gang in pairs(query) do
            local gangKey = tostring(gang.name or '')
            local gangLabel = tostring(gang.name or gangKey)
            if gangKey ~= '' and not Shared.IsGangBlacklisted(gangKey, gangLabel) then
                gangs[gangKey] = {
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
    local gangs = gang.GetGangs()
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

---@param _playerId number
---@return table|nil
function gang.GetPlayerGang(_playerId)
    local playerGang = exports['core_gangs']:getPlayerOrganization(_playerId)
    if playerGang then
        local gangName = tostring(playerGang)
        if Shared.IsGangBlacklisted(gangName, gangName) then
            return nil
        end
        return {
            name = gangName,
            label = gangName,
        }
    end
    return nil
end

return gang
