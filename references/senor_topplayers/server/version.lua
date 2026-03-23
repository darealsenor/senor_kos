local updateUrl = 'https://raw.githubusercontent.com/darealsenor/senor_topplayers-fivem/refs/heads/main/version'
local discordUrl = 'https://raw.githubusercontent.com/darealsenor/senor-scripts-related/refs/heads/main/discord'
local latestScriptReleaseUrl = 'https://raw.githubusercontent.com/darealsenor/senor-scripts-related/refs/heads/main/latest_script_release'
local tebexUrl = 'https://raw.githubusercontent.com/darealsenor/senor-scripts-related/refs/heads/main/tebex'

local fallbacks = {
    discord = 'https://discord.gg/Z5a9rM7UaG',
    latest_script_release = '1762932233',
    tebex = 'https://senor-scripts.tebex.io/'
}

local fetchedData = {
    version = nil,
    discord = fallbacks.discord,
    latest_script_release = fallbacks.latest_script_release,
    tebex = fallbacks.tebex
}

local requestDelay = 500
local totalRequests = 4
local completedRequests = 0
local versionCheckProcessed = false

---@param versionStr string
---@return number[]
local function parseVersionString(versionStr)
    local parts = {}
    for segment in versionStr:gmatch('[^%.]+') do
        local num = tonumber(segment)
        if num then
            parts[#parts + 1] = num
        end
    end
    return parts
end

---@param localVer string
---@param remoteVer string
---@return boolean
local function needsUpdate(localVer, remoteVer)
    local localSegments = parseVersionString(localVer)
    local remoteSegments = parseVersionString(remoteVer)
    local segmentCount = math.max(#localSegments, #remoteSegments)
    for idx = 1, segmentCount do
        local localVal = localSegments[idx] or 0
        local remoteVal = remoteSegments[idx] or 0
        if localVal < remoteVal then
            return true
        elseif localVal > remoteVal then
            return false
        end
    end
    return false
end

---@param body string|nil
---@return string|nil
local function sanitizeResponse(body)
    if not body then return nil end
    local cleaned = body:match('^[^\n\r]+')
    if cleaned then
        cleaned = cleaned:gsub('^%s+', ''):gsub('%s+$', '')
        if cleaned and cleaned ~= '' then
            return cleaned
        end
    end
    return nil
end

local function checkNewScriptRelease()
    local releaseTimestamp = tonumber(fetchedData.latest_script_release)
    if not releaseTimestamp or releaseTimestamp <= 0 then return end
    local currentTime = os.time()
    local timeDifference = currentTime - releaseTimestamp
    local daysAgo = math.floor(timeDifference / 86400)
    local thirtyDaysInSeconds = 30 * 86400
    if timeDifference >= 0 and timeDifference <= thirtyDaysInSeconds then
        lib.print.info(('^3SENOR released a script %d %s ago! Go check it out. ^7| ^2Discord: %s ^7| ^5Tebex: %s'):format(
            daysAgo,
            daysAgo == 1 and 'day' or 'days',
            fetchedData.discord,
            fetchedData.tebex
        ))
    end
end

local function processVersionCheck()
    local resource = GetCurrentResourceName()
    local installedVersion = GetResourceMetadata(resource, 'version', 0)
    if not installedVersion then return end
    if not fetchedData.version then
        lib.print.info('^1Unable to perform update check')
        return
    end
    local function stripVersionPrefix(version)
        local trimmed = version:gsub('^%s+', ''):gsub('%s+$', '')
        if trimmed:sub(1, 1):lower() == 'v' then
            return trimmed:sub(2)
        end
        return trimmed
    end
    local localVerNum = stripVersionPrefix(installedVersion)
    local remoteVerNum = stripVersionPrefix(fetchedData.version)
    if needsUpdate(localVerNum, remoteVerNum) then
        lib.print.info(('^3Update available for %s! (current: ^1%s^3, latest: ^2%s^3)'):format(resource, installedVersion, fetchedData.version))
        lib.print.info(('^3Check out the updates at: %s'):format(fetchedData.discord))
        lib.print.info(('^3Latest script release: %s | Tebex: %s'):format(fetchedData.latest_script_release, fetchedData.tebex))
    else
        lib.print.info('^2You are running the latest version of senor_topplayers. Thanks for buying! :)')
    end
    checkNewScriptRelease()
end

---@param url string
---@param key string
---@param delay number
local function makeRequest(url, key, delay)
    CreateThread(function()
        if delay and delay > 0 then
            Wait(delay)
        end
        PerformHttpRequest(url, function(status, body, headers)
            if status == 200 then
                local cleaned = sanitizeResponse(body)
                if cleaned then
                    fetchedData[key] = cleaned
                    lib.print.debug(('Successfully fetched %s from GitHub'):format(key))
                else
                    lib.print.debug(('Failed to parse %s response, using fallback'):format(key))
                end
            elseif status == 429 then
                lib.print.debug(('Rate limited when fetching %s (status: 429), using fallback'):format(key))
            elseif status == 403 then
                lib.print.debug(('Forbidden when fetching %s (status: 403), using fallback'):format(key))
            elseif status == 0 then
                lib.print.debug(('Network error when fetching %s, using fallback'):format(key))
            else
                lib.print.debug(('Failed to fetch %s (status: %d), using fallback'):format(key, status))
            end
            completedRequests = completedRequests + 1
            if completedRequests >= totalRequests and not versionCheckProcessed then
                versionCheckProcessed = true
                processVersionCheck()
            end
        end, 'GET', '', {
            ['User-Agent'] = 'FiveM-Resource-Check',
            ['Accept'] = 'text/plain'
        })
    end)
end

local function startVersionCheck()
    if Config.versionCheck ~= true then return end
    completedRequests = 0
    versionCheckProcessed = false
    fetchedData.version = nil
    fetchedData.discord = fallbacks.discord
    fetchedData.latest_script_release = fallbacks.latest_script_release
    fetchedData.tebex = fallbacks.tebex
    makeRequest(updateUrl, 'version', 0)
    makeRequest(discordUrl, 'discord', requestDelay)
    makeRequest(latestScriptReleaseUrl, 'latest_script_release', requestDelay * 2)
    makeRequest(tebexUrl, 'tebex', requestDelay * 3)
end

CreateThread(function()
    if GetCurrentResourceName() ~= 'senor_topplayers' then
        lib.print.info('^1[senor_topplayers] Resource name must be "senor_topplayers". Rename your resource folder and restart.')
        StopResource(GetCurrentResourceName())
        return
    end
    Wait(5000)
    startVersionCheck()
end)
