import { useEffect, useRef } from 'react'
import { useNuiStore } from '@/store/nuiStore'
import { isEnvBrowser } from '@/utils/misc'
import { mockMatchMessage } from '@/dev/mockMatch'
import { debugData } from '@/utils/debugData'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import type { MatchPlayerRow } from '@/types/match'
import type { KillfeedEntry, KillfeedPlayer } from '@/types/killfeed'

const DEV_KILL_INTERVAL_MS = 1800
const DEV_AVATAR_POOL = Array.from({ length: 5 }, (_, index) => `https://cdn.discordapp.com/embed/avatars/${index}.png`)

function toKillfeedPlayer(player: MatchPlayerRow): KillfeedPlayer {
  return {
    playerId: player.id,
    name: player.name?.trim() || `Player ${player.id}`,
    image: player.avatar || DEV_AVATAR_POOL[player.id % DEV_AVATAR_POOL.length],
  }
}

function buildMockKill(players: MatchPlayerRow[], killIndex: number): KillfeedEntry | null {
  if (players.length < 2) {
    return null
  }

  const killer = players[killIndex % players.length]
  const victim = players.find((player) => player.id !== killer.id && player.team !== killer.team)
    ?? players.find((player) => player.id !== killer.id)

  if (!victim) {
    return null
  }

  return {
    killer: toKillfeedPlayer(killer),
    victim: toKillfeedPlayer(victim),
    headshot: killIndex % 3 === 0,
    meters: 6 + (killIndex % 11) * 9,
    killId: `dev-kill-${killIndex}-${killer.id}-${victim.id}`,
  }
}

/**
 * Browser-only controls wired to {@link useNuiStore}. Frame visibility follows the same path as Lua via {@link debugData}.
 */
export function DevTools() {
  const matchData = useNuiStore((s) => s.matchData)
  const setMatchData = useNuiStore((s) => s.setMatchData)
  const scoreboardOpen = useNuiStore((s) => s.scoreboardOpen)
  const toggleScoreboard = useNuiStore((s) => s.toggleScoreboard)
  const adminOpen = useNuiStore((s) => s.adminOpen)
  const setAdminOpen = useNuiStore((s) => s.setAdminOpen)
  const setMenuMaps = useNuiStore((s) => s.setMenuMaps)
  const setMenuLoadouts = useNuiStore((s) => s.setMenuLoadouts)
  const setIsAdmin = useNuiStore((s) => s.setIsAdmin)
  const spectate = useNuiStore((s) => s.spectate)
  const setSpectate = useNuiStore((s) => s.setSpectate)
  const killTickRef = useRef(0)

  useEffect(() => {
    debugData([{ action: 'setVisible', data: Boolean(matchData) || adminOpen }], 0)
  }, [matchData, adminOpen])

  useEffect(() => {
    if (!isEnvBrowser()) {
      return
    }

    const players = matchData?.match?.players ?? []
    if (players.length < 2) {
      return
    }

    const interval = window.setInterval(() => {
      const kill = buildMockKill(players, killTickRef.current)
      killTickRef.current += 1

      if (!kill) {
        return
      }

      debugData([{ action: 'newKill', data: kill }], 0)
    }, DEV_KILL_INTERVAL_MS)

    return () => {
      window.clearInterval(interval)
    }
  }, [matchData])

  if (!isEnvBrowser()) {
    return null
  }

  return (
    <Card className="pointer-events-auto fixed bottom-4 left-4 z-[200] w-80 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Dev tools</CardTitle>
        {/* <CardDescription>Local NUI preview (development + browser only).</CardDescription> */}
      </CardHeader>
      <Separator />
      <CardContent className="grid gap-4 pt-4">
        <div className="grid gap-2">
          <Label htmlFor="kos-dev-match">Match payload</Label>
          <Button
            id="kos-dev-match"
            type="button"
            size="sm"
            variant={matchData ? 'default' : 'secondary'}
            onClick={() => setMatchData(matchData ? null : mockMatchMessage())}
          >
            {matchData ? 'Clear mock match' : 'Load mock match'}
          </Button>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="kos-dev-scoreboard">Scoreboard</Label>
          <Button id="kos-dev-scoreboard" type="button" size="sm" variant="outline" onClick={toggleScoreboard}>
            {scoreboardOpen ? 'Hide scoreboard' : 'Show scoreboard'}
          </Button>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="kos-dev-admin">KOS menu</Label>
          <Button
            id="kos-dev-admin"
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setIsAdmin(true)
              setMenuMaps([
                { id: 'groove_street', name: 'Groove Street' },
                { id: 'legion_square', name: 'Legion Square' },
              ])
              setMenuLoadouts([
                { id: 'pistol_50', name: 'Pistol 50 Loadout' },
                { id: 'rifle', name: 'Rifle Loadout' },
              ])
              setAdminOpen((open) => !open)
            }}
          >
            {adminOpen ? 'Close menu' : 'Open menu (admin)'}
          </Button>
          <Button
            id="kos-dev-admin-gangs"
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => {
              debugData([
                { action: 'setVisible', data: true },
                {
                  action: 'openMenu',
                  data: {
                    isAdmin: true,
                    maps: [
                      { id: 'groove_street', name: 'Groove Street' },
                      { id: 'legion_square', name: 'Legion Square' },
                      { id: 'skate_park', name: 'Skate Park' },
                    ],
                    loadouts: [
                      { id: 'pistol_50', name: 'Pistol 50 Loadout' },
                      { id: 'rifle', name: 'Rifle Loadout' },
                    ],
                  },
                },
              ], 0)
            }}
          >
            Preview 10 gangs
          </Button>
        </div>
        <div className="grid gap-2">
          <Label>Spectate overlay</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={spectate.visible && spectate.scope === 'team' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => {
                const players = matchData?.match?.players ?? []
                const target = players[0]?.id ?? 1
                setSpectate({
                  visible: true,
                  targetId: target,
                  scope: 'team',
                  prevKey: 'LEFT',
                  nextKey: 'RIGHT',
                  stopKey: 'BACK',
                  aliveCount: 3,
                })
              }}
            >
              Team
            </Button>
            <Button
              type="button"
              size="sm"
              variant={spectate.visible && spectate.scope === 'match' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => {
                const players = matchData?.match?.players ?? []
                const target = players[1]?.id ?? players[0]?.id ?? 1
                setSpectate({
                  visible: true,
                  targetId: target,
                  scope: 'match',
                  prevKey: 'LEFT',
                  nextKey: 'RIGHT',
                  stopKey: 'BACK',
                  aliveCount: undefined,
                })
              }}
            >
              Match
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="flex-1"
              onClick={() => setSpectate({ visible: false })}
            >
              Hide
            </Button>
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="kos-dev-announcer">Round Announcer</Label>
          <div className="flex gap-2">
            <Button
              id="kos-dev-announcer-start"
              type="button"
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => {
                debugData([
                  {
                    action: 'setAnnouncer',
                    data: {
                      visible: true,
                      type: 'start',
                      title: 'ROUND STARTING',
                      subtitle: 'PREPARE FOR BATTLE',
                      seconds: 3,
                      colorTheme: 'neutral',
                    },
                  },
                ], 0)
              }}
            >
              Start
            </Button>
            <Button
              id="kos-dev-announcer-end-a"
              type="button"
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => {
                debugData([
                  {
                    action: 'setAnnouncer',
                    data: {
                      visible: true,
                      type: 'end',
                      title: 'TEAM A WINS',
                      subtitle: 'NEXT ROUND IN',
                      seconds: 4,
                      colorTheme: 'teamA',
                    },
                  },
                ], 0)
              }}
            >
              Win A
            </Button>
            <Button
              id="kos-dev-announcer-end-b"
              type="button"
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => {
                debugData([
                  {
                    action: 'setAnnouncer',
                    data: {
                      visible: true,
                      type: 'end',
                      title: 'TEAM B WINS',
                      subtitle: 'NEXT ROUND IN',
                      seconds: 4,
                      colorTheme: 'teamB',
                    },
                  },
                ], 0)
              }}
            >
              Win B
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
