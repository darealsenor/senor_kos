local cachedCommands = {}

function IsTextACommand(input)
    return cachedCommands[input] and true or false
end

RegisterNetEvent('chat:addSuggestion')
RegisterNetEvent('chat:addSuggestions')
local addSuggestion = function(name, help, params)
    SendNUIMessage({
        action = 'ON_SUGGESTION_ADD',
        data = {
            name = name,
            help = help,
            params = params or {}
        }
    })
    cachedCommands[name] = true
end

exports('addSuggestion', addSuggestion)
AddEventHandler('chat:addSuggestion', addSuggestion)

AddEventHandler('chat:addSuggestions', function(suggestions)
    if not suggestions or type(suggestions) ~= 'table' or #suggestions == 0 then
        return
    end
    
    local valid = {}
    for i = 1, #suggestions do
        local s = suggestions[i]
        if s and s.name and s.help and s.params then
            table.insert(valid, s)
            cachedCommands[s.name:gsub('/', '')] = true
        end
    end
    
    if #valid > 0 then
        SendReactMessage('ON_SUGGESTION_ADD', valid)
    end
end)

local function refreshCommands()
    lib.waitFor(function() return IsNuiLoaded end, 'Nui was not loaded', 5000)
    Wait(100)
    
    
    local commands = GetRegisteredCommands()
    local suggestions = {}

    for _, cmd in ipairs(commands) do
        if cmd.name == 'toggleChat' or cmd.name == 'chat' then goto continue end
        
        local params = {}
        if cmd.params then
            for _, param in ipairs(cmd.params) do
                if type(param) == 'table' and param.name then
                    table.insert(params, param.name)
                elseif type(param) == 'string' then
                    table.insert(params, param)
                end
            end
        end
        
        local suggestion = {
            name = '/' .. cmd.name,
            help = cmd.help or '',
            params = params
        }
        
        table.insert(suggestions, suggestion)
        cachedCommands[cmd.name] = suggestion
        ::continue::
    end

    if #suggestions > 0 then
        TriggerEvent('chat:addSuggestions', suggestions)
    end
end

AddEventHandler('onClientResourceStart', function(resName)
    Wait(500)

    refreshCommands()
end)

AddEventHandler('onClientResourceStop', function(resName)
    Wait(500)

    refreshCommands()
end)
