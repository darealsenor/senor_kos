CreateThread(function()
    Wait(1000)
    local gangs = Bridge.framework.GetGangs()
    
    if gangs then
        for k, v in pairs(gangs) do
            if v.label then
                chat:AddChannel(v.label)
            end
        end
    end
end)

