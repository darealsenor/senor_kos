local active = false
local function toggleFirstperson(bool)
    active = bool

    if active then
        CreateThread(function()
            while active do
                Wait(Config.Settings.FirstPerson.UpdateInterval)
                SetFollowPedCamViewMode(Config.Settings.FirstPerson.ViewMode)
            end
        end)
    end
end

return {
    toggleFirstperson = toggleFirstperson
}