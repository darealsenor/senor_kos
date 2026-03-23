function initPropsDB()
    MySQL.query([[
        CREATE TABLE IF NOT EXISTS `senor_topplayers_props` (
            `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
            `x` FLOAT NOT NULL,
            `y` FLOAT NOT NULL,
            `z` FLOAT NOT NULL,
            `heading` FLOAT NOT NULL DEFAULT 0,
            `prop` VARCHAR(64) DEFAULT NULL,
            `label` VARCHAR(128) DEFAULT NULL,
            `enabled` TINYINT UNSIGNED NOT NULL DEFAULT 1
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ]])
end

---@return table
function LoadProps()
    local rows = MySQL.query.await('SELECT id, x, y, z, heading, prop, label, enabled FROM senor_topplayers_props ORDER BY id', {}) or {}
    local out = {}
    for _, row in ipairs(rows) do
        out[#out + 1] = {
            id = tonumber(row.id),
            coords = vector4(tonumber(row.x) or 0, tonumber(row.y) or 0, tonumber(row.z) or 0, tonumber(row.heading) or 0),
            prop = row.prop and tostring(row.prop) or nil,
            label = row.label and tostring(row.label) or nil,
            enabled = (tonumber(row.enabled) or 1) == 1,
        }
    end
    return out
end

---@param data table
---@param id number|nil
---@return number|nil
function SaveProp(data, id)
    if not data or not data.coords then return nil end
    local x, y, z, w = data.coords.x, data.coords.y, data.coords.z, data.coords.w or data.coords[4] or 0
    local prop = data.prop and tostring(data.prop) or nil
    local label = data.label and tostring(data.label) or nil
    local enabled = (data.enabled == nil or data.enabled) and 1 or 0

    if id and tonumber(id) then
        MySQL.update.await([[
            UPDATE senor_topplayers_props SET x = ?, y = ?, z = ?, heading = ?, prop = ?, label = ?, enabled = ?
            WHERE id = ?
        ]], { x, y, z, w, prop, label, enabled, tonumber(id) })
        return tonumber(id)
    end

    local insertId = MySQL.insert.await([[
        INSERT INTO senor_topplayers_props (x, y, z, heading, prop, label, enabled)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ]], { x, y, z, w, prop, label, enabled })
    return insertId
end

---@param id number
---@return boolean
function DeleteProp(id)
    if not id or not tonumber(id) then return false end
    MySQL.update.await('DELETE FROM senor_topplayers_props WHERE id = ?', { tonumber(id) })
    return true
end

CreateThread(function()
    initPropsDB()
end)
