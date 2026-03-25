local storage = {}

---@param identifier string
---@return table|nil
function storage.LoadPlayerStats(identifier)
    if not identifier or identifier == '' then
        return nil
    end

    local result = MySQL.single.await('SELECT * FROM kos_players WHERE identifier = ?', { identifier })
    if not result then
        return nil
    end

    return {
        identifier = tostring(result.identifier),
        name = result.name and tostring(result.name) or nil,
        avatar = result.avatar and tostring(result.avatar) or nil,
        gang = (result.gang_key and tostring(result.gang_key) ~= '') and {
            name = tostring(result.gang_key),
            label = (result.gang_name and tostring(result.gang_name)) or tostring(result.gang_key),
        } or nil,
        kills = tonumber(result.kills) or 0,
        deaths = tonumber(result.deaths) or 0,
        headshots = tonumber(result.headshots) or 0,
        playtime = tonumber(result.playtime) or 0,
        matchesPlayed = tonumber(result.matches_played) or 0,
        wins = tonumber(result.wins) or 0,
        losses = tonumber(result.losses) or 0,
    }
end

---@param payload table
---@return boolean
function storage.UpsertPlayerStats(payload)
    if not payload or not payload.identifier or payload.identifier == '' then
        return false
    end

    MySQL.insert.await([[
        INSERT INTO kos_players (
            identifier, name, avatar, gang_key, gang_name, kills, deaths, headshots, playtime, matches_played, wins, losses
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            avatar = VALUES(avatar),
            gang_key = VALUES(gang_key),
            gang_name = VALUES(gang_name),
            kills = VALUES(kills),
            deaths = VALUES(deaths),
            headshots = VALUES(headshots),
            playtime = VALUES(playtime),
            matches_played = VALUES(matches_played),
            wins = VALUES(wins),
            losses = VALUES(losses),
            updated_at = CURRENT_TIMESTAMP
    ]], {
        payload.identifier,
        payload.name,
        payload.avatar,
        payload.gang and payload.gang.name or nil,
        payload.gang and payload.gang.label or nil,
        payload.kills or 0,
        payload.deaths or 0,
        payload.headshots or 0,
        payload.playtime or 0,
        payload.matchesPlayed or 0,
        payload.wins or 0,
        payload.losses or 0,
    })

    return true
end

---@param payload table
---@return boolean
function storage.UpsertGangStats(payload)
    local gangName = payload and payload.gang and payload.gang.name or nil
    if not gangName or gangName == '' then
        return false
    end

    MySQL.insert.await([[
        INSERT INTO kos_gangs (
            gang_key, gang_name, kills, deaths, matches_played, wins, losses
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            gang_name = VALUES(gang_name),
            kills = kills + VALUES(kills),
            deaths = deaths + VALUES(deaths),
            matches_played = matches_played + VALUES(matches_played),
            wins = wins + VALUES(wins),
            losses = losses + VALUES(losses),
            updated_at = CURRENT_TIMESTAMP
    ]], {
        gangName,
        payload.gang and payload.gang.label or gangName,
        payload.kills or 0,
        payload.deaths or 0,
        payload.matchesPlayed or 0,
        payload.wins or 0,
        payload.losses or 0,
    })

    return true
end

---@param payload table
---@return boolean
function storage.InsertMatchHistory(payload)
    if not payload or not payload.matchId or payload.matchId == '' then
        return false
    end

    MySQL.insert.await([[
        INSERT INTO kos_history (
            match_id, winner_team, winner_gang_key, winner_gang_name, duration, participants_json
        ) VALUES (?, ?, ?, ?, ?, ?)
    ]], {
        payload.matchId,
        payload.winnerTeam,
        payload.winnerGang and payload.winnerGang.name or nil,
        payload.winnerGang and payload.winnerGang.label or nil,
        payload.duration or 0,
        json.encode(payload.participants or {}),
    })

    return true
end

return storage
