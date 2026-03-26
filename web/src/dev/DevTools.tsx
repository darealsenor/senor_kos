import { useEffect } from 'react'
import { useNuiStore } from '@/store/nuiStore'
import { isEnvBrowser } from '@/utils/misc'
import { mockMatchMessage } from '@/dev/mockMatch'
import { debugData } from '@/utils/debugData'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

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
  const setIsAdmin = useNuiStore((s) => s.setIsAdmin)

  useEffect(() => {
    debugData([{ action: 'setVisible', data: Boolean(matchData) || adminOpen }], 0)
  }, [matchData, adminOpen])

  if (!isEnvBrowser()) {
    return null
  }

  return (
    <Card className="pointer-events-auto fixed bottom-4 left-4 z-[200] w-80 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Dev tools</CardTitle>
        <CardDescription>Local NUI preview (development + browser only).</CardDescription>
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
              setAdminOpen((open) => !open)
            }}
          >
            {adminOpen ? 'Close menu' : 'Open menu (admin)'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
