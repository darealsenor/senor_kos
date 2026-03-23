Config = Config or {}

Config.appTitle = 'Top Players'
Config.theme = 'red'

Config.defaultPodiumTextTemplate = '~w~[~y~#{{rank}}~w~] ~w~ - ~g~{{name}} ~w~ - ~r~{{category}} ~w~ - ~p~{{value}}'

Config.commands = {
    leaderboard = { name = 'topplayers' },
    admin = { name = 'topplayersadmin', restricted = 'group.admin' },
    savestats = { name = 'savestats', restricted = 'group.admin' },
}

Config.headshotsOnKillOnly = false

Config.Admin = {
    qb = { permissions = { 'qbcore.god', 'admin' } },
    esx = { groups = { 'admin', 'superadmin', 'mod' }, permissions = { 'admin', 'superadmin' } },
    ox = { permissions = { 'admin', 'superadmin' } },
    qbx = { permissions = { 'qbcore.god', 'admin' } },
    default = { permissions = { 'admin', 'command' } },
}

Config.cache = {
    podiumTtlSec = 120,
    leaderboardTotalCountTtlSec = 60,
    serverStatsTtlSec = 60,
}

Config.combat = {
    deathCooldownMs = 1500,
}

Config.versionCheck = true

Config.leaderboard = {
    defaultLimit = 25,
    maxLimit = 100,
}

Config.placement = {
    rotateSpeed = 1.5,
    baseSpeed = 0.06,
    heightSpeed = 0.02,
    speedMultHigh = 2.0,
    speedMultLow = 0.25,
    raycastDistance = 15.0,
}

Config.propList = {
    { model = 'rcnk_podium_01', label = 'Podium 01' },
    { model = 'rcnk_podium_02', label = 'Podium 02' },
    { model = 'rcnk_podium_03', label = 'Podium 03' },
}

Config.pedAnimations = {
    { id = 'none', label = 'None', dict = '', anim = '', flag = 1 },
    { id = 'idle', label = 'Idle', dict = 'anim@heists@heist_corona@team_idles@male_a', anim = 'idle', flag = 1 },
    { id = 'idle2', label = 'Idle 2', dict = 'anim@heists@heist_corona@team_idles@female_a', anim = 'idle', flag = 1 },
    { id = 'idle3', label = 'Idle 3', dict = 'anim@heists@humane_labs@finale@strip_club', anim = 'ped_b_celebrate_loop', flag = 1 },
    { id = 'crossarms', label = 'Crossed arms', dict = 'amb@world_human_hang_out_street@female_arms_crossed@idle_a', anim = 'idle_a', flag = 1 },
    { id = 'phone', label = 'Phone', dict = 'cellphone@', anim = 'cellphone_text_read_base', flag = 1 },
    { id = 'bartender', label = 'Bartender', dict = 'anim@amb@clubhouse@bar@drink@idle_a', anim = 'idle_a_bartender', flag = 1 },
    { id = 'sit', label = 'Sit', dict = 'anim@amb@business@bgen@bgen_no_work@', anim = 'sit_phone_phoneputdown_idle_nowork', flag = 1 },
    { id = 'sitchair', label = 'Sit chair', dict = 'timetable@ron@ig_5_p3', anim = 'ig_5_p3_base', flag = 1 },
    { id = 'leanbar', label = 'Lean bar', dict = 'amb@prop_human_bum_shopping_cart@male@idle_a', anim = 'idle_c', flag = 1 },
    { id = 'dance', label = 'Dance', dict = 'anim@amb@nightclub@mini@dance@dance_solo@male@var_a@', anim = 'high_center', flag = 1 },
    { id = 'dance2', label = 'Dance 2', dict = 'anim@amb@nightclub@mini@dance@dance_solo@male@var_b@', anim = 'high_center_down', flag = 1 },
    { id = 'danceslow', label = 'Dance slow', dict = 'anim@amb@nightclub@mini@dance@dance_solo@male@var_b@', anim = 'low_center', flag = 1 },
    { id = 'dancef', label = 'Dance F', dict = 'anim@amb@nightclub@dancers@solomun_entourage@', anim = 'mi_dance_facedj_17_v1_female^1', flag = 1 },
}
