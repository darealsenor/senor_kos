function StartSpawnPointPlacement(initialList, cb)
    local list = initialList or {}
    SetNuiFocus(false, false)
    SendReactMessage('spawnPlacementActive', true)
    lib.showTextUI(
        '[E]         - Add Spawn Point  \n' ..
        '[G]         - Delete Last Point  \n' ..
        '[X]         - Cancel  \n' ..
        '[ENTER]     - Confirm',
        { position = 'bottom-center' }
    )
    local active = true
    CreateThread(function()
        while active do
            Wait(0)
            for j = 1, #list do
                local pt = list[j]
                local mType = Config.placementMarkerType or 1
                local mCol = Config.placementMarkerColour or { 50, 205, 50, 180 }
                DrawMarker(mType, pt.x, pt.y, pt.z - 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.5, 1.5, 1.0,
                    mCol[1], mCol[2], mCol[3], mCol[4],
                    false, false, 0, false, false, false, false)
            end
            if IsControlJustPressed(0, 38) then
                local c = GetEntityCoords(cache.ped)
                local heading = GetEntityHeading(cache.ped)
                list[#list + 1] = { x = c.x, y = c.y, z = c.z, heading = math.floor(heading + 0.5) }
            elseif IsControlJustPressed(0, 47) then
                if #list > 0 then table.remove(list) end
            elseif IsControlJustPressed(0, 73) then
                active = false
                lib.hideTextUI()
                SendReactMessage('spawnPlacementActive', false)
                SetNuiFocus(true, true)
                cb({ cancelled = true })
                return
            elseif IsControlJustPressed(0, 191) or IsControlJustPressed(0, 201) then
                active = false
                lib.hideTextUI()
                SendReactMessage('spawnPlacementActive', false)
                SetNuiFocus(true, true)
                local out = {}
                for j = 1, #list do
                    local pt = list[j]
                    out[j] = { x = pt.x, y = pt.y, z = pt.z, heading = pt.heading }
                end
                cb({ spawnPoints = out })
                return
            end
        end
    end)
end
