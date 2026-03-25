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
            -- mimic qbox gangs structure
            gangs[gang.name] = {
                label = gang.name,
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
    local gangs = gang.GetGangs() or {}
    local found = gangs[gangName]
    return {
        name = gangName,
        label = (found and (found.label or found.name)) or gangName,
    }
end

---@param _playerId number
---@return table|nil
function gang.GetPlayerGang(_playerId)
    return nil
end

return gang