local random = math.random

local function EnoughPlayers()
    return GetNumPlayerIndices() >= Config.PrizeReduction.MinPlayers
end

local function uuid()
    local template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    return string.gsub(template, '[xy]', function(c)
        local v = (c == 'x') and random(0, 0xf) or random(8, 0xb)
        return string.format('%x', v)
    end)
end

local function adminOnly(fn)
    return function(source, ...)
        if not Bridge.framework.IsAdmin(source) then
            return { success = false, message = locale('notification_not_admin') }
        end
        return fn(source, ...)
    end
end

return {
    uuid = uuid,
    adminOnly = adminOnly,
    EnoughPlayers = EnoughPlayers,
}
