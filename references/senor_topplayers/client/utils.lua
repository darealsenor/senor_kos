---@param action string
---@param data any
function SendReactMessage(action, data)
    SendNUIMessage({ action = action, data = data })
end

---@return table
local function getUILocales()
    local lang = GetConvar('ox:locale', 'en')
    return lib.loadJson(('locales.%s'):format(lang)) or {}
end

function SendTopplayersConfig()
    SendReactMessage('senor_topplayers:config', {
        locale = getUILocales(),
        theme = Config.theme or 'violet',
        appTitle = Config.appTitle or 'Top Players',
    })
end
