CreateThread(function()
    MySQL.query.await([[
        CREATE TABLE IF NOT EXISTS `airdrop_locations` (
    `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NULL,
    `coords` VARCHAR(255) NULL
)
COLLATE='utf8mb4_general_ci';
    ]])

    MySQL.query.await([[
        CREATE TABLE IF NOT EXISTS `airdrop_prizes` (
    `id` INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `amount` INT(11) NOT NULL DEFAULT 1
)
COLLATE='utf8mb4_general_ci';

    ]])
end)
