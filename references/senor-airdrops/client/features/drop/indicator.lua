local current = nil

local function set(data)
    current = data
end
local function get()
    return current
end

local function IsInside(data)
    if not current then return false end
    if current.id == data.id then return true end
    return false
end

return {
    set = set,
    get = get,
    isInside = IsInside
}
