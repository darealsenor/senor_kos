local Ox = require '@ox_core.lib.init'
local framework = {}

function framework.IsAdmin(playerId)
    local adminConfig = Config.Admin and Config.Admin.ox
    if not adminConfig or not adminConfig.permissions then return false end
    for _, permission in ipairs(adminConfig.permissions) do
        if IsPlayerAceAllowed(playerId, permission) then return true end
    end
    return false
end

function framework.GetPlayerName(playerId)
    local player = Ox.GetPlayer(playerId)
    if not player then return nil end
    local first = player.get('firstName')
    local last = player.get('lastName')
    if first and last then
        return ('%s %s'):format(first, last)
    end
    return player.username or nil
end

function framework.GetMoney(playerId)
    local player = Ox.GetPlayer(playerId)
    if not player then return nil end
    local account = player.getAccount()
    if not account then return nil end
    local balance = account.get and account.get('balance')
    if balance == nil then return nil end
    return {
        cash = balance or 0,
        bank = 0,
    }
end

function framework.GetVehicles(playerId)
    local player = Ox.GetPlayer(playerId)
    if not player then return nil end
    local charId = player.charId
    if not charId then return nil end
    local count = MySQL.scalar.await('SELECT COUNT(*) FROM vehicles WHERE owner = ?', { charId })
    return count or 0
end

function framework.GetProperties(playerId)
    return 0
end

function framework.GetPlayerIdentifier(playerId)
    local player = Ox.GetPlayer(playerId)
    if not player then return nil end
    local charId = player.charId
    return charId and tostring(charId) or nil
end

AddEventHandler('ox:playerLoaded', function(playerId)
    TriggerEvent('senor_topplayers:playerLoaded', playerId)
end)

return framework
