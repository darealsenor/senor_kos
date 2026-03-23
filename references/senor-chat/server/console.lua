if not Config.Compatibility or not Config.Compatibility.consolePrints then
    return
end

AddEventHandler('__cfx_internal:serverPrint', function(msg)
    if not msg then return end
    
    lib.print.info(msg)
    
    local channel = chat:GetChannelByName("Global")
    if channel then
        chat:LocalMessage(-1, {
            message = msg,
            sender = 'CONSOLE',
            channel = channel,
            tags = {}
        })
    end
end)

