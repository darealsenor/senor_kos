local Airdrops = {}

local function isDropIntersecting(newCoords, dropDistance)
    if not next(Airdrops) then 
        return { success = false, message = locale('error_no_intersection') }
    end
    
    for _, drop in ipairs(Airdrops) do
        local dist = #(vec3(drop.coords.x, drop.coords.y, drop.coords.z) - vec3(newCoords.x, newCoords.y, newCoords.z))
        if dist < (drop.distance + dropDistance) then
            return { 
                success = true, 
                message = locale('error_too_close'),
                intersectingDrop = drop
            }
        end
    end
    
    return { success = false, message = locale('error_no_intersection') }
end

local function GetAirdrops(bool)
    if not bool then return Airdrops end
    
    local airdrops = {}
    for i = 1, #Airdrops do
        airdrops[#airdrops+1] = Airdrops[i]:get()
    end

    return airdrops
end

local function GetDropById(id)
    for i = 1, #Airdrops do
        local drop = Airdrops[i]
        if drop.id == id then
            return drop
        end
    end
    return false
end


local function AddAirdrop(Airdrop)
    table.insert(Airdrops, Airdrop)
    TriggerClientEvent("senor-airdrops:client:NewDrop", -1, Airdrop:get())
end

local function RemoveAirdrop(airdropInstance)
    if not airdropInstance or type(airdropInstance) ~= 'table' then
        return false
    end

    for i = 1, #Airdrops do
        if Airdrops[i].id == airdropInstance.id then
            table.remove(Airdrops, i)
            TriggerClientEvent("senor-airdrops:client:RemovedDrop", -1, airdropInstance:get())
            return true
        end
    end
    
    return false
end

return {
    AddAirdrop = AddAirdrop,
    GetAirdrops = GetAirdrops,
    RemoveAirdrop = RemoveAirdrop,
    GetDropById = GetDropById,
    isDropIntersecting = isDropIntersecting,
}
