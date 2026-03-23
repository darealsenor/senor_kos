---@param callback function
local function initTables(callback)
    MySQL.query([[
        CREATE TABLE IF NOT EXISTS `squads` (
            `id` VARCHAR(64) PRIMARY KEY,
            `name` VARCHAR(64) NOT NULL UNIQUE,
            `image` TEXT,
            `password` VARCHAR(255),
            `maxplayers` INT NOT NULL DEFAULT 4,
            `owner_identifier` VARCHAR(64) NOT NULL,
            `last_active` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    ]], {}, function()
        MySQL.query([[
            CREATE TABLE IF NOT EXISTS `squad_members` (
                `squad_id`   VARCHAR(64) NOT NULL,
                `identifier` VARCHAR(64) NOT NULL,
                `is_owner`   TINYINT(1) DEFAULT 0,
                `name`       VARCHAR(128) DEFAULT '',
                `image`      TEXT DEFAULT '',
                PRIMARY KEY (`squad_id`, `identifier`),
                FOREIGN KEY (`squad_id`) REFERENCES `squads`(`id`) ON DELETE CASCADE
            )
        ]], {}, function()
            MySQL.query('ALTER TABLE `squad_members` ADD COLUMN IF NOT EXISTS `name` VARCHAR(128) DEFAULT \'\'', {})
            MySQL.query('ALTER TABLE `squad_members` ADD COLUMN IF NOT EXISTS `image` TEXT DEFAULT \'\'', {})
            callback()
        end)
    end)
end

---@param squadId string
---@param name string
---@param image string
---@param password string | nil
---@param maxplayers number
---@param ownerIdentifier string
function DB_SaveSquad(squadId, name, image, password, maxplayers, ownerIdentifier)
    MySQL.query([[
        INSERT INTO `squads` (`id`, `name`, `image`, `password`, `maxplayers`, `owner_identifier`, `last_active`)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON DUPLICATE KEY UPDATE
            `name` = VALUES(`name`),
            `image` = VALUES(`image`),
            `password` = VALUES(`password`),
            `maxplayers` = VALUES(`maxplayers`),
            `owner_identifier` = VALUES(`owner_identifier`),
            `last_active` = CURRENT_TIMESTAMP
    ]], { tostring(squadId), name, image, password, maxplayers, ownerIdentifier })
end

---@param squadId string
function DB_DeleteSquad(squadId)
    MySQL.query('DELETE FROM `squads` WHERE `id` = ?', { tostring(squadId) })
end

---@param squadId string
---@param identifier string
---@param isOwner boolean
---@param name string | nil
---@param image string | nil
function DB_SaveMember(squadId, identifier, isOwner, name, image)
    MySQL.query([[
        INSERT INTO `squad_members` (`squad_id`, `identifier`, `is_owner`, `name`, `image`)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            `is_owner` = VALUES(`is_owner`),
            `name`     = VALUES(`name`),
            `image`    = VALUES(`image`)
    ]], { tostring(squadId), identifier, isOwner and 1 or 0, name or '', image or '' })
end

---@param squadId string
---@param identifier string
function DB_RemoveMember(squadId, identifier)
    MySQL.query('DELETE FROM `squad_members` WHERE `squad_id` = ? AND `identifier` = ?', { tostring(squadId), identifier })
end

---@param squadId string
function DB_TouchSquad(squadId)
    MySQL.query('UPDATE `squads` SET `last_active` = CURRENT_TIMESTAMP WHERE `id` = ?', { tostring(squadId) })
end

---@param callback function
function DB_LoadAllSquads(callback)
    MySQL.query('SELECT * FROM `squads`', {}, function(squads)
        if not squads or #squads == 0 then
            callback({})
            return
        end
        MySQL.query('SELECT * FROM `squad_members`', {}, function(members)
            local membersBySquad = {}
            for _, m in ipairs(members or {}) do
                if not membersBySquad[m.squad_id] then
                    membersBySquad[m.squad_id] = {}
                end
                membersBySquad[m.squad_id][#membersBySquad[m.squad_id] + 1] = m
            end
            local result = {}
            for _, squad in ipairs(squads) do
                result[#result + 1] = {
                    squad = squad,
                    members = membersBySquad[squad.id] or {}
                }
            end
            callback(result)
        end)
    end)
end

---@param days number
function DB_PurgeExpiredSquads(days)
    MySQL.query(
        'DELETE FROM `squads` WHERE `last_active` < DATE_SUB(NOW(), INTERVAL ? DAY)',
        { days }
    )
end

---@param callback function
function DB_Init(callback)
    initTables(callback)
end
