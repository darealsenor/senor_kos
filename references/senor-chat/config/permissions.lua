Config = Config or {}

-- ace permissions are different between frameworks, could be qbcore.admin, command, god, whatever
-- and you'd have to add this below into your server.cfg - it would only work on server restart pretty sure
-- add_ace resource.senor-chat command.add_ace allow
-- add_ace resource.senor-chat command.remove_ace allow
-- add_ace resource.senor-chat command.add_principal allow
-- add_ace resource.senor-chat command.remove_principal allow

Config.PermissionMap = {
    ['group.admin'] = {
        "admin",
        "mutePlayer",
        "unmutePlayer",
        "deleteMessage",
        "accessStaffChannel",
        "viewMuteStatus",
    },
    ['identifier.discord:481772420194107402'] = {
        "admin",
        "mutePlayer",
        "unmutePlayer",
        "deleteMessage",
        "accessStaffChannel",
        "viewMuteStatus",
    },
    -- specific players /w permissions:
    -- Example: ['identifier.license:abc123def456'] = {
    --     "mutePlayer",
    --     "unmutePlayer",
    --     "deleteMessage",
    -- },
    -- Example: ['identifier.discord:123456789'] = {
    --     "accessStaffChannel",
    -- },
    -- Example: ['identifier.xbox:123456789'] = {
    --     "viewMuteStatus",
    -- },
    -- Example: ['identifier.ip:127.0.0.1'] = {
    --     "admin",
    -- },
}
