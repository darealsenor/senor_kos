Shared = Shared or {}

Shared.Gangs = {
    Blacklist = { 'no Gang', 'none' },
}

---@param value any
---@return string
local function normalizeGangValue(value)
    local str = tostring(value or '')
    str = str:lower()
    str = str:gsub('^%s+', '')
    str = str:gsub('%s+$', '')
    return str
end

---@param gangKey string|nil
---@param gangLabel string|nil
---@return boolean
Shared.IsGangBlacklisted = function(gangKey, gangLabel)
    local blacklist = (Shared.Gangs and Shared.Gangs.Blacklist) or {}
    local key = normalizeGangValue(gangKey)
    local label = normalizeGangValue(gangLabel)
    for i = 1, #blacklist do
        local blocked = normalizeGangValue(blacklist[i])
        if blocked ~= '' and (blocked == key or blocked == label) then
            return true
        end
    end
    return false
end
