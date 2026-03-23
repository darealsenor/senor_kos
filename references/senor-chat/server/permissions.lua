local function permissionName(name)
    return string.format('%s_%s', GetCurrentResourceName(), name)
end

Permissions = {
    ADMIN = "admin",
    MUTE_PLAYER = "mutePlayer",
    UNMUTE_PLAYER = "unmutePlayer",
    DELETE_MESSAGE = "deleteMessage",
    ACCESS_STAFF_CHANNEL = "accessStaffChannel",
    VIEW_MUTE_STATUS = "viewMuteStatus",
}

Ace = {}

Ace.AddPrincipal = function(child, parent)
    local success, err = pcall(function()
        ExecuteCommand(string.format('add_principal %s %s', child, parent))
    end)
end

Ace.RemovePrincipal = function(child, parent)
    local success, err = pcall(function()
        ExecuteCommand(string.format('remove_principal %s %s', child, parent))
    end)
end

Ace.Allow = function(identifier, resource)
    local permName = permissionName(resource)
    local success, err = pcall(function()
        ExecuteCommand(string.format('add_ace %s %s allow', identifier, permName))
    end)
end

Ace.Deny = function(identifier, resource)
    local permName = permissionName(resource)
    local success, err = pcall(function()
        ExecuteCommand(string.format('add_ace %s %s deny', identifier, permName))
    end)
end

Ace.Can = function(source, rule)
    return IsPlayerAceAllowed(source, permissionName(rule))
end

Ace.CanGroup = function(group, rule)
    return IsPrincipalAceAllowed(group, permissionName(rule))
end

function HasPermission(playerId, permission)
    local hasDirect = Ace.Can(playerId, permission)
    if hasDirect then
        return true
    end
    
    if not Config.PermissionMap then
        return false
    end
    
    for identifierKey, permissions in pairs(Config.PermissionMap) do
        if type(permissions) == "table" then
            for _, perm in ipairs(permissions) do
                if perm == permission then
                    local hasPrincipal = IsPlayerAceAllowed(playerId, identifierKey)
                    if hasPrincipal then
                        local principalHasPermission = Ace.CanGroup(identifierKey, permission)
                        if principalHasPermission then
                            return true
                        end
                    end
                    break
                end
            end
        end
    end
    
    return false
end

function GetPlayerPermissions(playerId)
    local permissions = {}
    
    for _, permName in pairs(Permissions) do
        permissions[permName] = HasPermission(playerId, permName)
    end
    
    return permissions
end

function IsAdmin(playerId)
    if not Config.PermissionMap then
        return false
    end
    
    return HasPermission(playerId, Permissions.ADMIN)
end

local function SetupPermissions()
    if not Config.PermissionMap then
        return
    end
    
    for identifierKey, permissions in pairs(Config.PermissionMap) do
        if type(permissions) == "table" then
            for _, permission in ipairs(permissions) do
                Ace.Allow(identifierKey, permission)
            end
        end
    end
end

AddEventHandler('onServerResourceStart', function(resourceName)
    if resourceName == GetCurrentResourceName() then
        CreateThread(function()
            Wait(1000)
            SetupPermissions()
        end)
    end
end)

CreateThread(function()
    Wait(2000)
    SetupPermissions()
end)

