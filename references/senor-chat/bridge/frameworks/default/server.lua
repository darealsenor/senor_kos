local framework = {}

function framework.GetPlayer(playerId)
    return {
        PlayerData = {}
    }
end

function framework.GetPlayerName(playerId)
    return GetPlayerName(playerId) or "Unknown"
end

function framework.IsAdmin(playerId)
    if IsAdmin and IsAdmin(playerId) then
            return true
    end
    
    return false
end

function framework.GetGangs()
    return {}
end

AddEventHandler('playerDropped', function()
    local src = source
    TriggerEvent('senor-chat:playerDropped', src)
end)

return framework

