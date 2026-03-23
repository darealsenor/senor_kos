local history = {}

local function add(playerId, data)
    local playerName = Bridge.framework.GetPlayerName(playerId)
    if playerName == "Unknown" then return end
    history[#history + 1] = {
        name = playerName,
        gang = "-", -- I really don't know how other frameworks 
                    -- handle gang label etc so disabled for now I guess.
        drop = data
    }
end

local function get()
    return history
end

return {
    add = add,
    get = get
}
