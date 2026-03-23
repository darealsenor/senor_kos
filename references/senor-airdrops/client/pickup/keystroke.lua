local utils = require 'client.utils.utils'

local function init(point, data)
    if point and point.currentDistance < Config.Interaction.KeystrokeDistance and data.timeLeft <= 0 then
        if IsControlJustPressed(0, Config.Interaction.KeystrokeControl) and utils.CanOpenDrop() then
            TriggerServerEvent('senor-airdrops:server:Opendrop', data.id)
        end
    end
end

return {
    init = init
}