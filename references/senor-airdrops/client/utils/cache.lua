local weaponLimiter = require 'client.features.weapon.limiter'

lib.onCache('weapon', function(hash)
    if not hash then return end

    local isActive = weaponLimiter.getState()
    if not isActive then return end

    weaponLimiter.validateWeapon(hash)
end)