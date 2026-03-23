--[[ 
    Note from script developer: this feature was 
    intended to use on my own server, you can either ignore this file
    or implement it by yourself, its pretty much irrelveant.
]]



-- RegisterNetEvent('kaves_airdrop:client:GlowingBags', function(coords, rgb)
--     local drops = exports['kaves_lootbag']:GetDrops()
--     if next(drops) then
--         for _, drop in pairs(drops) do
--             local distance = #(vector3(drop.coords) - coords)

--             if distance <= 350 then
--                 SetEntityDrawOutline(drop.entity, true)
--                 SetEntityDrawOutlineColor(rgb.r or 255, rgb.g or 255, rgb.b or 255, 100)
--             end
--         end
--     end
-- end)

-- local PZFX = exports['pzfx']:InjectLib()
-- RegisterNetEvent('kaves_airdrop:client:winner')
-- AddEventHandler('kaves_airdrop:client:winner', function(rgb)
--     PZFX.Effects.Aura(nil, {
--         dict = "wpn_flare",
--         particle = "proj_heist_flare_trail",
--         size = 0.2,
--         duration = 10000,
--         rgb = { r = rgb.r / 255 or 0.2, g = rgb.g / 255 or 0.7, b = rgb.b / 255 or 0.9 },
--         alpha = 0.5,
--         numParticelle = 200,
--         raggio = 1.05
--     })
-- end)
