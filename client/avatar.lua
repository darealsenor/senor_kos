local mugshotResource = 'MugShotBase64'
local mugshotCallback = 'kos:avatar:getMugshot64'

local function getMugshot64()
    if GetResourceState(mugshotResource) ~= 'started' then
        return ''
    end
    local ped = cache.ped
    if not ped or ped == 0 or not DoesEntityExist(ped) then
        return ''
    end
    local ok, result = pcall(function()
        return exports[mugshotResource]:GetMugShotBase64(ped, true)
    end)
    if not ok or type(result) ~= 'string' or result == '' then
        return ''
    end
    if result:find('^data:') then
        return result
    end
    return 'data:image/png;base64,' .. result
end

lib.callback.register(mugshotCallback, function()
    return getMugshot64()
end)
