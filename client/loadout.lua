local AUTO_PULL_RETRIES = 10
local AUTO_PULL_RETRY_DELAY_MS = 200

local function autoPullWeapon()
    if Config.autoPullWeapon ~= true then
        return
    end

    if not Bridge or not Bridge.inventory or type(Bridge.inventory.AutoPullWeapon) ~= 'function' then
        return
    end

    CreateThread(function()
        for _ = 1, AUTO_PULL_RETRIES do
            if Bridge.inventory.AutoPullWeapon() then
                return
            end

            Wait(AUTO_PULL_RETRY_DELAY_MS)
        end
    end)
end

RegisterNetEvent(Events.CLIENT_ROUND_START, function(payload)
    if not payload or payload.matchId ~= KOSState.matchId then
        return
    end

    autoPullWeapon()
end)
