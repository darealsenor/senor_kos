AvatarConfig = {
    type = 'mugshot',
    discord = {
        token = '',
        guild = '',
    },
    mugshot = {
        resource = 'MugShotBase64',
        callback = 'senor_topplayers:avatar:getFromClient',
    },
}

if AvatarConfig.type == 'discord' and (not AvatarConfig.discord.token or not AvatarConfig.discord.guild) then
    print('Discord avatar needs token and guild.')
    AvatarConfig.type = 'steam'
end
if AvatarConfig.type == 'mugshot' and GetResourceState(AvatarConfig.mugshot.resource) ~= 'started' then
    print('Mugshot resource not started.')
    AvatarConfig.type = 'steam'
end