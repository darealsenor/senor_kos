local cfg = AvatarConfig and AvatarConfig.mugshot

lib.callback.register(cfg.callback, function()
    if GetResourceState(cfg.resource) ~= 'started' then return '' end
    local ped = cache.ped
    local ok, result = pcall(function()
        return exports[cfg.resource]:GetMugShotBase64(ped, true)
    end)
    if not ok or type(result) ~= 'string' or #result == 0 then return '' end
    if result:find('^data:') then return result end
    return 'data:image/png;base64,' .. result
end)
