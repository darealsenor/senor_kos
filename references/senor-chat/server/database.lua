function initDB()
    MySQL.query([[
        CREATE TABLE IF NOT EXISTS `senor_chat_data` (
            `license` VARCHAR(50) NOT NULL PRIMARY KEY,
            `tags` LONGTEXT DEFAULT NULL,
            `colors` LONGTEXT DEFAULT NULL,
            `selectedTag` LONGTEXT DEFAULT NULL,
            `selectedColor` LONGTEXT DEFAULT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ]])
    
    MySQL.query([[
        CREATE TABLE IF NOT EXISTS `senor_chat_mutes` (
            `license` VARCHAR(50) NOT NULL PRIMARY KEY,
            `muted_until` BIGINT DEFAULT NULL,
            `muted_by` VARCHAR(50) DEFAULT NULL,
            `reason` TEXT DEFAULT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ]])
end

function LoadChatData(license)
    if not license then return nil end
    
    local result = MySQL.single.await('SELECT * FROM senor_chat_data WHERE license = ?', { license })
    if not result then
        return { tags = {}, colors = {}, selectedTag = nil, selectedColor = nil }
    end
    
    return {
        tags = result.tags and json.decode(result.tags) or {},
        colors = result.colors and json.decode(result.colors) or {},
        selectedTag = result.selectedTag and json.decode(result.selectedTag) or nil,
        selectedColor = result.selectedColor and json.decode(result.selectedColor) or nil
    }
end

function SaveChatData(license, data)
    if not license then return false end
    
    MySQL.insert.await([[
        INSERT INTO senor_chat_data (license, tags, colors, selectedTag, selectedColor)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            tags = VALUES(tags),
            colors = VALUES(colors),
            selectedTag = VALUES(selectedTag),
            selectedColor = VALUES(selectedColor)
    ]], {
        license,
        data.tags and json.encode(data.tags),
        data.colors and json.encode(data.colors),
        data.selectedTag and json.encode(data.selectedTag),
        data.selectedColor and json.encode(data.selectedColor)
    })
    
    return true
end

function LoadMuteData(license)
    if not license then return nil end
    
    local result = MySQL.single.await('SELECT * FROM senor_chat_mutes WHERE license = ?', { license })
    if not result then return nil end
    
    return {
        muted_until = result.muted_until,
        muted_by = result.muted_by,
        reason = result.reason,
        created_at = result.created_at
    }
end

function SaveMuteData(license, data)
    if not license then return false end
    
    MySQL.insert.await([[
        INSERT INTO senor_chat_mutes (license, muted_until, muted_by, reason)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            muted_until = VALUES(muted_until),
            muted_by = VALUES(muted_by),
            reason = VALUES(reason),
            created_at = CURRENT_TIMESTAMP
    ]], { license, data.muted_until, data.muted_by, data.reason })
    
    return true
end

function RemoveMuteData(license)
    if not license then return false end
    MySQL.query.await('DELETE FROM senor_chat_mutes WHERE license = ?', { license })
    return true
end

AddEventHandler('onServerResourceStart', function(resName)
    if resName == GetCurrentResourceName() then
        initDB()
    end
end)

