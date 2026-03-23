MySQL.query.await([[
    CREATE TABLE IF NOT EXISTS `redzones` (
        `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        `type` VARCHAR(32) NOT NULL DEFAULT 'permanent',
        `data` JSON NOT NULL
    ) COLLATE='utf8mb4_general_ci';
]])

MySQL.query.await([[
    CREATE TABLE IF NOT EXISTS `redzone_presets` (
        `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        `name` VARCHAR(128) NOT NULL,
        `data` JSON NOT NULL
    ) COLLATE='utf8mb4_general_ci';
]])

local function seedPresetZones()
    local rows = MySQL.query.await('SELECT id, data FROM redzones WHERE type = ?', { 'permanent' })
    local existing = {}
    if rows then
        for i = 1, #rows do
            local data = json.decode(rows[i].data)
            if data and data.name then existing[data.name] = true end
        end
    end
    local zones = PresetZones.getPresetZones()
    for i = 1, #zones do
        local name = zones[i].name
        if name and not existing[name] then
            MySQL.insert.await('INSERT INTO redzones (type, data) VALUES (?, ?)', { 'permanent', json.encode(zones[i]) })
        end
    end
end

seedPresetZones()
