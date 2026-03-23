function initDB()
    MySQL.query([[
        CREATE TABLE IF NOT EXISTS `senor_topplayers_stats` (
            `identifier` VARCHAR(64) NOT NULL PRIMARY KEY,
            `kills` INT UNSIGNED NOT NULL DEFAULT 0,
            `deaths` INT UNSIGNED NOT NULL DEFAULT 0,
            `damage` INT UNSIGNED NOT NULL DEFAULT 0,
            `headshots` INT UNSIGNED NOT NULL DEFAULT 0,
            `playtime` INT UNSIGNED NOT NULL DEFAULT 0,
            `money` BIGINT NOT NULL DEFAULT 0,
            `vehicles` INT UNSIGNED DEFAULT NULL,
            `properties` INT UNSIGNED DEFAULT NULL,
            `rp_name` VARCHAR(128) DEFAULT NULL,
            `steam_name` VARCHAR(128) DEFAULT NULL,
            `avatar` MEDIUMTEXT DEFAULT NULL,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_kills (kills DESC),
            INDEX idx_deaths (deaths DESC),
            INDEX idx_damage (damage DESC),
            INDEX idx_headshots (headshots DESC),
            INDEX idx_playtime (playtime DESC),
            INDEX idx_money (money DESC),
            INDEX idx_vehicles (vehicles DESC),
            INDEX idx_properties (properties DESC)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ]])
end

---@param identifier string
---@return table|nil data
---@return boolean|nil isNew true when no DB row existed
function LoadPlayerStats(identifier)
    if not identifier or type(identifier) ~= 'string' or identifier == '' then return nil end

    local result = MySQL.single.await('SELECT * FROM senor_topplayers_stats WHERE identifier = ?', { identifier })
    if not result then
        return {
            identifier = identifier,
            kills = 0,
            deaths = 0,
            damage = 0,
            headshots = 0,
            playtime = 0,
            money = 0,
            vehicles = nil,
            properties = nil,
            rp_name = nil,
            steam_name = nil,
            avatar = nil,
        }, true
    end

    return {
        identifier = result.identifier and tostring(result.identifier) or nil,
        kills = tonumber(result.kills) or 0,
        deaths = tonumber(result.deaths) or 0,
        damage = tonumber(result.damage) or 0,
        headshots = tonumber(result.headshots) or 0,
        playtime = tonumber(result.playtime) or 0,
        money = tonumber(result.money) or 0,
        vehicles = result.vehicles and tonumber(result.vehicles) or nil,
        properties = result.properties and tonumber(result.properties) or nil,
        rp_name = result.rp_name and tostring(result.rp_name) or nil,
        steam_name = result.steam_name and tostring(result.steam_name) or nil,
        avatar = result.avatar and tostring(result.avatar) or nil,
    }, false
end

---@param identifier string
---@param data table
---@return boolean
function SavePlayerStats(identifier, data)
    if not identifier or type(identifier) ~= 'string' or identifier == '' or not data then return false end

    MySQL.insert.await([[
        INSERT INTO senor_topplayers_stats (identifier, kills, deaths, damage, headshots, playtime, money, vehicles, properties, rp_name, steam_name, avatar)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            kills = VALUES(kills),
            deaths = VALUES(deaths),
            damage = VALUES(damage),
            headshots = VALUES(headshots),
            playtime = VALUES(playtime),
            money = VALUES(money),
            vehicles = VALUES(vehicles),
            properties = VALUES(properties),
            rp_name = VALUES(rp_name),
            steam_name = VALUES(steam_name),
            avatar = VALUES(avatar),
            updated_at = CURRENT_TIMESTAMP
    ]], {
        identifier,
        data.kills or 0,
        data.deaths or 0,
        data.damage or 0,
        data.headshots or 0,
        data.playtime or 0,
        data.money or 0,
        data.vehicles,
        data.properties,
        data.rp_name,
        data.steam_name,
        data.avatar,
    })

    return true
end

CreateThread(initDB)
