function initPedsDB()
    MySQL.query([[
        CREATE TABLE IF NOT EXISTS `senor_topplayers_peds` (
            `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
            `x` FLOAT NOT NULL,
            `y` FLOAT NOT NULL,
            `z` FLOAT NOT NULL,
            `heading` FLOAT NOT NULL DEFAULT 0,
            `category` VARCHAR(32) NOT NULL,
            `category_ranking` INT UNSIGNED NOT NULL DEFAULT 1,
            `text` VARCHAR(256) DEFAULT NULL,
            `label` VARCHAR(128) DEFAULT NULL,
            `identifier` VARCHAR(64) DEFAULT NULL,
            `enabled` TINYINT UNSIGNED NOT NULL DEFAULT 1,
            `anim_dict` VARCHAR(64) DEFAULT NULL,
            `anim_name` VARCHAR(64) DEFAULT NULL,
            `anim_flag` INT UNSIGNED NOT NULL DEFAULT 1
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ]])
end

---@return table
function LoadPeds()
    local rows = MySQL.query.await('SELECT id, x, y, z, heading, category, category_ranking, text, label, identifier, enabled, anim_dict, anim_name, anim_flag FROM senor_topplayers_peds ORDER BY id', {}) or {}
    local out = {}
    for _, row in ipairs(rows) do
        local animDict = row.anim_dict and tostring(row.anim_dict) or nil
        local animName = row.anim_name and tostring(row.anim_name) or nil
        local animation = nil
        if animDict and animDict ~= '' and animName and animName ~= '' then
            animation = { dict = animDict, anim = animName, flag = math.max(0, tonumber(row.anim_flag) or 1) }
        end
        out[#out + 1] = {
            id = tonumber(row.id),
            coords = vector4(tonumber(row.x) or 0, tonumber(row.y) or 0, tonumber(row.z) or 0, tonumber(row.heading) or 0),
            category = tostring(row.category or DEFAULT_STAT_CATEGORY),
            categoryRanking = math.max(1, tonumber(row.category_ranking) or 1),
            text = row.text and tostring(row.text) or nil,
            label = row.label and tostring(row.label) or nil,
            identifier = row.identifier and tostring(row.identifier) or nil,
            enabled = (tonumber(row.enabled) or 1) == 1,
            animation = animation,
        }
    end
    return out
end

---@param data table
---@param id number|nil
---@return number|nil
function SavePed(data, id)
    if not data or not data.coords then return nil end
    local x, y, z, w = data.coords.x, data.coords.y, data.coords.z, data.coords.w or data.coords[4] or 0
    local category = tostring(data.category or DEFAULT_STAT_CATEGORY)
    local categoryRanking = math.max(1, tonumber(data.categoryRanking) or 1)
    local text = data.text and tostring(data.text) or nil
    local label = data.label and tostring(data.label) or nil
    local identifier = data.identifier and tostring(data.identifier) or nil
    local enabled = (data.enabled == nil or data.enabled) and 1 or 0
    local animDict = nil
    local animName = nil
    local animFlag = 1
    if data.animation and data.animation.dict and data.animation.anim then
        animDict = tostring(data.animation.dict)
        animName = tostring(data.animation.anim)
        animFlag = math.max(0, tonumber(data.animation.flag) or 1)
    end

    if id and tonumber(id) then
        MySQL.update.await([[
            UPDATE senor_topplayers_peds SET x = ?, y = ?, z = ?, heading = ?, category = ?, category_ranking = ?, text = ?, label = ?, identifier = ?, enabled = ?, anim_dict = ?, anim_name = ?, anim_flag = ?
            WHERE id = ?
        ]], { x, y, z, w, category, categoryRanking, text, label, identifier, enabled, animDict, animName, animFlag, tonumber(id) })
        return tonumber(id)
    end

    local insertId = MySQL.insert.await([[
        INSERT INTO senor_topplayers_peds (x, y, z, heading, category, category_ranking, text, label, identifier, enabled, anim_dict, anim_name, anim_flag)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ]], { x, y, z, w, category, categoryRanking, text, label, identifier, enabled, animDict, animName, animFlag })
    return insertId
end

---@param id number
---@return boolean
function DeletePed(id)
    if not id or not tonumber(id) then return false end
    MySQL.update.await('DELETE FROM senor_topplayers_peds WHERE id = ?', { tonumber(id) })
    return true
end

CreateThread(function()
    initPedsDB()
end)
