Maps = {
    {
        id = 'groove_street',
        name = 'Groove Street',
        coords = {
            teamA = {
                vec4(-135.63, -1562.88, 33.25, 9.59),
            },
            teamB = {
                vec4(-155.12, -1562.35, 33.98, 187.53),
            },
        },
        boundary = {
            center = vec3(-145.37, -1562.62, 33.5),
            radius = 100.0,
        },
    },
    {
        id = 'legion_square',
        name = 'Legion Square',
        coords = {
            teamA = {
                vec4(195.2, -934.1, 30.7, 0.0),
            },
            teamB = {
                vec4(215.4, -934.2, 30.7, 180.0),
            },
        },
        boundary = {
            center = vec3(205.3, -934.15, 30.7),
            radius = 85.0,
        },
    },
}

---@param mapId string|nil
---@return table|nil
function Maps.get(mapId)
    if Maps[1] == nil then
        return nil
    end
    if not mapId or mapId == '' then
        return Maps[1]
    end
    for i = 1, #Maps do
        local entry = Maps[i]
        if type(entry) == 'table' and entry.id == mapId then
            return entry
        end
    end
    return Maps[1]
end

---@return { id: string, name: string }[]
function Maps.listForUi()
    local out = {}
    for i = 1, #Maps do
        local m = Maps[i]
        if type(m) == 'table' and m.id and m.name then
            out[#out + 1] = { id = m.id, name = m.name }
        end
    end
    return out
end
