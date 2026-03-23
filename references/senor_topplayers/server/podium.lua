local CACHE_TTL_SEC = (Config.cache and Config.cache.podiumTtlSec) or 120

local podiumCache = {}
local cacheUpdatedAt = 0

local function capitalizeFirst(s)
    if not s or s == '' then return s end
    return s:sub(1, 1):upper() .. s:sub(2)
end

local function formatPodiumText(template, name, category, rank, value)
    if not template or type(template) ~= 'string' then return nil end
    name = name or ''
    category = capitalizeFirst(category or '')
    rank = rank and tostring(rank) or ''
    value = value ~= nil and tostring(value) or ''
    return (template:gsub('{{name}}', name):gsub('{{category}}', category):gsub('{{rank}}', rank):gsub('{{value}}', value))
end

---@return table
function GetPodiumsForClient()
    local propConfigs = LoadProps()
    local pedConfigs = LoadPeds()
    local props = {}
    for _, p in ipairs(propConfigs) do
        if p.enabled then
            props[#props + 1] = {
                id = p.id,
                coords = p.coords,
                prop = p.prop,
            }
        end
    end

    local rankPedsByCategory = {}
    for _, p in ipairs(pedConfigs) do
        if p.enabled and (not p.identifier or p.identifier == '') then
            local category = ALLOWED_STAT_FIELDS[p.category] and p.category or DEFAULT_STAT_CATEGORY
            if not rankPedsByCategory[category] then
                rankPedsByCategory[category] = {}
            end
            rankPedsByCategory[category][#rankPedsByCategory[category] + 1] = { ped = p, rank = p.categoryRanking }
        end
    end

    local entriesByCategory = {}
    for category, list in pairs(rankPedsByCategory) do
        local maxRank = 0
        for _, item in ipairs(list) do
            if item.rank and item.rank > maxRank then maxRank = item.rank end
        end
        if maxRank >= 1 then
            local page = GetLeaderboardPage(category, maxRank, 0, nil)
            local entries = page and page.entries or {}
            entriesByCategory[category] = entries
        end
    end

    local peds = {}
    for _, p in ipairs(pedConfigs) do
        if p.enabled then
            local category = ALLOWED_STAT_FIELDS[p.category] and p.category or DEFAULT_STAT_CATEGORY
            local entry
            if p.identifier and p.identifier ~= '' then
                local stats = LoadPlayerStats(p.identifier)
                if stats then
                    entry = {
                        identifier = stats.identifier,
                        rp_name = stats.rp_name,
                        steam_name = stats.steam_name,
                        kills = stats.kills or 0,
                        deaths = stats.deaths or 0,
                        damage = stats.damage or 0,
                        headshots = stats.headshots or 0,
                        playtime = stats.playtime or 0,
                        money = stats.money or 0,
                        vehicles = stats.vehicles,
                        properties = stats.properties,
                    }
                    entry[category] = entry[category] or stats[category]
                end
            end
            if not entry and entriesByCategory[category] then
                local entries = entriesByCategory[category]
                local rank = p.categoryRanking and tonumber(p.categoryRanking) or 1
                entry = rank >= 1 and entries[rank] or nil
            end
            local displayName = (entry and (entry.rp_name and entry.rp_name ~= '' and entry.rp_name or entry.steam_name)) or nil
            local value = entry and entry[category]
            local template = (p.text and p.text ~= '') and p.text or Config.defaultPodiumTextTemplate
            local label = formatPodiumText(template, displayName, category, p.categoryRanking, value)

            local identifier = entry and entry.identifier
            local appearance = identifier and Bridge.appearance.GetPlayerAppearance(identifier) or nil

            local player = nil
            if entry then
                player = {
                    name = displayName,
                    value = value,
                    kills = entry.kills or 0,
                    deaths = entry.deaths or 0,
                    damage = entry.damage or 0,
                    headshots = entry.headshots or 0,
                    playtime = entry.playtime or 0,
                    money = entry.money or 0,
                    vehicles = entry.vehicles,
                    properties = entry.properties,
                    appearance = appearance,
                }
            end

            peds[#peds + 1] = {
                id = p.id,
                coords = p.coords,
                category = category,
                categoryRanking = p.categoryRanking,
                text = label or p.text,
                player = player,
                animation = p.animation,
            }
        end
    end
    return { props = props, peds = peds }
end

function GetCachedPodiums()
    local now = os.time()
    if cacheUpdatedAt > 0 and (now - cacheUpdatedAt) < CACHE_TTL_SEC then
        return podiumCache
    end
    podiumCache = GetPodiumsForClient()
    cacheUpdatedAt = now
    return podiumCache
end

function InvalidatePodiumCache()
    cacheUpdatedAt = 0
end

lib.callback.register('senor_topplayers:server:GetPodiums', function()
    return GetCachedPodiums()
end)
