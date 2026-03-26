AvatarConfig = AvatarConfig or {}

AvatarConfig.type = AvatarConfig.type or 'mugshot64'

AvatarConfig.discord = AvatarConfig.discord or {
    token = '',
    guild = '',
}

AvatarConfig.mugshot64 = AvatarConfig.mugshot64 or {
    resource = 'MugShotBase64',
    callback = 'kos:avatar:getMugshot64',
}

if AvatarConfig.type == 'discord' and (AvatarConfig.discord.token == '' or AvatarConfig.discord.guild == '') then
    print('[senor_kos] Discord avatar requires token and guild, falling back to steam.')
    AvatarConfig.type = 'steam'
end

if AvatarConfig.type == 'mugshot64' and GetResourceState(AvatarConfig.mugshot64.resource) ~= 'started' then
    print('[senor_kos] Mugshot64 resource not started, falling back to steam.')
    AvatarConfig.type = 'steam'
end
