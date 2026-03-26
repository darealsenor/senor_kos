---@param source number
local function openKosMenu(source)
    if source <= 0 then
        return
    end

    local isAdmin = Bridge.framework.IsAdmin(source)

    TriggerClientEvent(Events.CLIENT_OPEN_ADMIN, source, { isAdmin = isAdmin })
end

if Interaction.command.enabled then
    lib.addCommand(Interaction.command.commands, {
        help = Interaction.command.help,
        params = {},
    }, function(source)
        openKosMenu(source)
    end)
end

RegisterNetEvent('kos:server:openMenu', function()
    local src = source
    openKosMenu(src)
end)
