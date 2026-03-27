Locale = Locale or {}

---@return table<string, string>
function Locale.GetData()
    local path = ('locales.%s'):format(lib.getLocaleKey() or 'en')
    return lib.loadJson(path)
end
