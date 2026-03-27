local function initDB()
    MySQL.query([[
        CREATE TABLE IF NOT EXISTS `kos_players` (
            `identifier` VARCHAR(64) NOT NULL PRIMARY KEY,
            `name` VARCHAR(128) DEFAULT NULL,
            `avatar` MEDIUMTEXT DEFAULT NULL,
            `gang_key` VARCHAR(64) DEFAULT NULL,
            `gang_name` VARCHAR(64) DEFAULT NULL,
            `kills` INT UNSIGNED NOT NULL DEFAULT 0,
            `deaths` INT UNSIGNED NOT NULL DEFAULT 0,
            `headshots` INT UNSIGNED NOT NULL DEFAULT 0,
            `playtime` INT UNSIGNED NOT NULL DEFAULT 0,
            `matches_played` INT UNSIGNED NOT NULL DEFAULT 0,
            `wins` INT UNSIGNED NOT NULL DEFAULT 0,
            `losses` INT UNSIGNED NOT NULL DEFAULT 0,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX `idx_kos_players_gang_key` (`gang_key`),
            INDEX `idx_kos_players_gang_name` (`gang_name`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ]])

    MySQL.query([[
        CREATE TABLE IF NOT EXISTS `kos_gangs` (
            `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
            `gang_key` VARCHAR(64) NOT NULL,
            `gang_name` VARCHAR(64) NOT NULL,
            `kills` INT UNSIGNED NOT NULL DEFAULT 0,
            `deaths` INT UNSIGNED NOT NULL DEFAULT 0,
            `matches_played` INT UNSIGNED NOT NULL DEFAULT 0,
            `wins` INT UNSIGNED NOT NULL DEFAULT 0,
            `losses` INT UNSIGNED NOT NULL DEFAULT 0,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY `uniq_kos_gangs_key` (`gang_key`),
            INDEX `idx_kos_gangs_name` (`gang_name`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ]])

    MySQL.query([[
        CREATE TABLE IF NOT EXISTS `kos_history` (
            `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
            `match_id` VARCHAR(64) NOT NULL,
            `winner_team` VARCHAR(32) DEFAULT NULL,
            `winner_gang_key` VARCHAR(64) DEFAULT NULL,
            `winner_gang_name` VARCHAR(64) DEFAULT NULL,
            `loser_gang_key` VARCHAR(64) DEFAULT NULL,
            `loser_gang_name` VARCHAR(64) DEFAULT NULL,
            `duration` INT UNSIGNED NOT NULL DEFAULT 0,
            `participants_json` LONGTEXT NOT NULL,
            `ended_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX `idx_kos_history_match` (`match_id`),
            INDEX `idx_kos_history_ended` (`ended_at`),
            INDEX `idx_kos_history_winner_gang_key` (`winner_gang_key`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ]])

end

local function upsertGangs()
    local gangs = Bridge.gangs.GetGangs()
    for gangName, gangData in pairs(gangs) do
        local gangLabel = (gangData and (gangData.label or gangData.name)) or gangName
        local blocked = Shared.IsGangBlacklisted(gangName, gangLabel)
        if not blocked then
            MySQL.query([[
                INSERT IGNORE INTO `kos_gangs` (`gang_key`, `gang_name`, `kills`, `deaths`, `matches_played`, `wins`, `losses`)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ]], { gangName, gangLabel, 0, 0, 0, 0, 0 })
        end
    end
end

CreateThread(initDB)
CreateThread(upsertGangs)
