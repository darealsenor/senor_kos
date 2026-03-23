Blips = {}

function Blips.createBlip(data)
    local coords = data.coords
    local blipColour = data.blipColour or Config.blipColour
    local blipName = data.blipName or data.name
    local radiusBlip = AddBlipForRadius(coords.x, coords.y, coords.z, data.radius)
    SetBlipColour(radiusBlip, blipColour)
    SetBlipAlpha(radiusBlip, Config.blipAlpha or 180)
    SetBlipDisplay(radiusBlip, Config.blipDisplay or 4)
    local pointBlip = AddBlipForCoord(coords.x, coords.y, coords.z)
    SetBlipSprite(pointBlip, Config.blipSprite or 161)
    SetBlipColour(pointBlip, blipColour)
    SetBlipScale(pointBlip, Config.blipScale or 0.8)
    SetBlipDisplay(pointBlip, Config.blipDisplay or 4)
    if blipName then
        BeginTextCommandSetBlipName('STRING')
        AddTextComponentString(blipName)
        EndTextCommandSetBlipName(pointBlip)
    end
    return { radiusBlip, pointBlip }
end

