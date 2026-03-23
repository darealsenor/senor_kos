lib.locale()

function GetLocaleData()
    local phrases = {}
    for k, v in pairs(lib.getLocales()) do
        phrases[k] = v
    end
    return phrases
end

function GetLocalizedChannelName(channelName)
    if channelName == "Global" then
        return locale('channel_global')
    elseif channelName == "Staff" then
        return locale('channel_staff')
    end
    return channelName
end

function IsLockdownEnabled()
    if not Config.Presets or not Config.Presets.enabled then
        return false
    end
    
    local defaultPreset = Config.Presets.default or 'dm'
    local preset = Config.Presets.presets[defaultPreset]
    if not preset then
        return false
    end
    
    return preset.lockdown == true
end

function GetMaxCustomTags()
    if not Config.Presets or not Config.Presets.enabled then
        return 2
    end
    
    local defaultPreset = Config.Presets.default or 'dm'
    local preset = Config.Presets.presets[defaultPreset]
    if not preset then
        return 2
    end
    
    return preset.maxCustomTags or 2
end
