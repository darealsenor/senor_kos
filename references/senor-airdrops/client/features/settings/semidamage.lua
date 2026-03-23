local active = false
local function toggleSemiDamage(bool)
    active = bool
    SetPlayerWeaponDamageModifier(cache.playerId, bool and Config.Settings.SemiDamage.FullDamage or Config.Settings.SemiDamage.HalfDamage)
end

return {
    toggleSemiDamage = toggleSemiDamage
}