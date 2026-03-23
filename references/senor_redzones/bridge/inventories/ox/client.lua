local inventory = {}
local ox_inventory = exports.ox_inventory

function inventory.Items(itemName)
    return ox_inventory:Items(itemName)
end

return inventory
