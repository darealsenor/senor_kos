local function init(entity, data)
    Bridge.target.addLocalEntity(entity, {
        label = locale('interaction_collect_drop'),
        name = entity,
        canInteract = function(entity, distance, coords, name, bone)
            return not (Bridge.framework.IsDead() or distance > Config.Interaction.MaxDistance)
        end,
        onSelect = function()
            TriggerServerEvent('senor-airdrops:server:Opendrop', data.id)
        end
    })
end

local function remove(entity)
    Bridge.target.removeLocalEntity(entity)
end

return {
    init = init,
    remove = remove
}
