-- ['Regular'] = 616,
-- ['Pistols'] = 623,
-- ['Semi'] =  403,
-- -- ['Solo'] = 120,
-- -- ['HS'] = 119,
-- ['Firstperson'] = 502,
-- ['Pistol Firstperson'] = 622,
-- ['Hands'] = 154,

local function GetBlip(weaponType)
    if weaponType and Config.Customization.Blip.Sprites[weaponType] then
        return Config.Customization.Blip.Sprites[weaponType]
    end
    return Config.Customization.Blip.sprite
end

return {
    GetBlip = GetBlip
}