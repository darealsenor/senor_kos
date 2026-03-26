Interaction = {
    ['npc'] = {
        enabled = true,
        coords = vec4(220.59, -46.14, 69.13, 126.96),
        model = 'mp_m_shopkeep_01',
        distance = 20.0,
        interaction = {
            ['target'] = {
                enabled = true,
                distance = 3.0,
                label = locale('open_menu_target'),
                icon = 'fas fa-gamepad',
                onSelect = function()
                    TriggerServerEvent('kos:server:openMenu')
                end
            },
            ['keystroke'] = {
                enabled = true,
                key = {
                    code = 38,
                    label = 'open_menu_keystroke'
                },
                onPressed = function()
                    TriggerServerEvent('kos:server:openMenu')
                end
            }
        }
    },
    ['command'] = {
        enabled = true,
        commands = { 'kos', 'kosmenu' },
        help = 'open_menu_command_help',
        onCommand = function(source, args, raw)
            TriggerServerEvent('kos:server:openMenu')
        end
    },
    ['keybind'] = {
        enabled = false,
        name = 'senor_kos_menu',
        description = 'open_menu_keybind_description',
        defaultKey = 'K',
        onPressed = function()
            TriggerServerEvent('kos:server:openMenu')
        end
    },

}
