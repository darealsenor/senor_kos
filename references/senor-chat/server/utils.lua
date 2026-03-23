function StringFilter(str)
    local blacklist = false
    local word

    local urlPatterns = {
        "https?://[%w-_%.%?%.:/%+=&]+",
        "www%.[%w-_%.]+",
        "%.com",
    }

    for _, pattern in ipairs(urlPatterns) do
        if string.match(str, pattern) then
            blacklist = true
            word = locale('message_error_url_detected')
            break
        end
    end
    for _, badword in ipairs(Config.Words) do
        if string.match(string.lower(str), badword) then
            blacklist = true
            word = badword
            break
        end
    end

    return blacklist, word
end