local firstperson = require 'client.features.settings.firstperson'
local semidamage = require 'client.features.settings.semidamage'

local settingsFactory = {}

function settingsFactory.init(data)
    -- if data.settings.HS then
    --     -- cba, not implemented yet
    -- end

    if data.settings.Firstperson then
        firstperson.toggleFirstperson(true)
    end

    if data.settings.SemiDamage then
        semidamage.toggleSemiDamage(true)
    end

    -- if data.settings.SlowMotion then
    --     -- cba, not implemented yet
    -- end

    -- if data.settings.SuperJump then
    --     -- cba, not implemented yet
    -- end

    -- if data.settings.Solo then
    --     -- cba, not implemented yet
    -- end
end

function settingsFactory.disable(data)
    -- if data.settings.HS then
    --     -- cba, not implemented yet
    -- end

    if data.settings.Firstperson then
        firstperson.toggleFirstperson(false)
    end

    if data.settings.SemiDamage then
        semidamage.toggleSemiDamage(false)
    end

    -- if data.settings.SlowMotion then
    --     -- cba, not implemented yet
    -- end

    -- if data.settings.SuperJump then
    --     -- cba, not implemented yet
    -- end

    -- if data.settings.Solo then
    --     -- cba, not implemented yet
    -- end
end

return settingsFactory
