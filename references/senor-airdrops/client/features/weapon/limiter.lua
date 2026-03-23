local weaponLimiter = {}

local active = false

local weaponPreset = nil

local hashes = require 'shared.weapons'.weaponHashes

function weaponLimiter.set(bool, weaponpreset)
    active = bool
    weaponPreset = weaponpreset
end

function weaponLimiter.getState()
    return active
end

function weaponLimiter.disarm()
    Bridge.notify.Notify({
        id = 'airdrops',
        title = locale('notification_warning_title'),
        description = locale('notification_warning_weapon_not_allowed'),
        type = 'warning',
        position = 'center-left'
    })
    TriggerEvent('ox_inventory:disarm', false)
end

function weaponLimiter.validateWeapon(weaponHash)
    if not active or not weaponPreset then return end
    if not weaponHash then return end
    if weaponPreset == 'Regular' then return end

    if hashes[weaponPreset] then
        if not hashes[weaponPreset][weaponHash] then
            return weaponLimiter.disarm()
        end
    end
end

return weaponLimiter
