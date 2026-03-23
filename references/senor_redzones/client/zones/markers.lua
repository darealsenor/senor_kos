local running = false

Markers = {}

local function getCoords(entry)
    local c = entry.coords
    if not c then return nil, nil, nil end
    local x, y, z = c.x, c.y, c.z
    if type(x) == 'number' and type(y) == 'number' and type(z) == 'number' then return x, y, z end
    return nil, nil, nil
end

function Markers.runMarkersLoop()
    if running then return end
    running = true
    CreateThread(function()
        while next(State.Zones) do
            Wait(0)
            local playerCoords = GetEntityCoords(cache.ped)
            local keys = {}
            for k in pairs(State.Zones) do keys[#keys + 1] = k end
            for i = 1, #keys do
                local entry = State.Zones[keys[i]]
                if not entry or not entry.coords then goto continue end
                local cx, cy, cz = getCoords(entry)
                if not cx or not cy or not cz then goto continue end
                local radius = entry.radius or 0
                local drawDistance = radius + State.MarkersDrawDistance
                local dist = #(playerCoords - vector3(cx, cy, cz))
                if dist < drawDistance then
                    local mc = entry.markerColour or State.DEFAULT_MARKER_COLOUR
                    local markerType = Config.markerType or 28
                    DrawMarker(markerType, cx + 0.0, cy + 0.0, cz + 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
                        radius + 0.0, radius + 0.0, radius + 0.0, mc[1], mc[2], mc[3], mc[4], false, false, 0, false,
                        false, false, false)
                end
                ::continue::
            end
        end
        running = false
    end)
end
