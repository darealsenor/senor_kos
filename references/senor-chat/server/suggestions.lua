local function getCommandSuggestions(player)
    local suggestions = {}
    
    if not GetRegisteredCommands then return suggestions end
    
    local commands = GetRegisteredCommands()
    for _, cmd in ipairs(commands) do
        if cmd.name == 'toggleChat' or cmd.name == 'chat' then goto continue end
        if not IsPlayerAceAllowed(player, ('command.%s'):format(cmd.name)) then goto continue end
        
        local params = {}
        if cmd.params then
            for _, param in ipairs(cmd.params) do
                if type(param) == 'table' and param.name then
                    table.insert(params, param.name)
                elseif type(param) == 'string' then
                    table.insert(params, param)
                elseif type(param) == 'number' then
                    table.insert(params, tostring(param))
                end
            end
        end
        
        table.insert(suggestions, {
            name = '/' .. cmd.name,
            help = cmd.help or '',
            params = params
        })
        ::continue::
    end
    
    return suggestions
end

local function refreshCommands(player)
    local suggestions = getCommandSuggestions(player)
    TriggerClientEvent('chat:addSuggestions', player, suggestions)
end

AddEventHandler('onServerResourceStart', function(resName)
    if resName == GetCurrentResourceName() then
        Wait(1000)
        for _, player in ipairs(GetPlayers()) do
            refreshCommands(player)
        end
    end
end)

AddEventHandler('senor-chat:playerLoaded', function(playerId)
    Wait(1000)
    refreshCommands(playerId)
end)
