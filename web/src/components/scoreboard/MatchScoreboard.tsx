import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { KosMatchPayload, MatchPlayerRow } from '@/types/match'
import { X } from 'lucide-react'
import { PlayerPortrait, type TeamColor } from '@/components/hud/PlayerPortrait'

interface MatchScoreboardProps {
  data: KosMatchPayload
  localPlayerId: number
  open: boolean
  onClose: () => void
}

function sortPlayers(rows: MatchPlayerRow[]): MatchPlayerRow[] {
  return [...rows].sort((a, b) => {
    if (b.kills !== a.kills) return b.kills - a.kills
    if (b.deaths !== a.deaths) return a.deaths - b.deaths
    return (a.name ?? '').localeCompare(b.name ?? '')
  })
}

/**
 * Full-screen scoreboard listing all match players.
 */
export function MatchScoreboard({ data, localPlayerId, open, onClose }: MatchScoreboardProps) {
  if (!open) return null

  const redColor: TeamColor = 'red'
  const blueColor: TeamColor = 'blue'

  const redPlayers = sortPlayers(data.players.filter((p) => p.team === 'teamA'))
  const bluePlayers = sortPlayers(data.players.filter((p) => p.team === 'teamB'))

  return (
    <div className="pointer-events-auto fixed inset-0 z-scoreboard flex items-center justify-center bg-black/70 p-4 md:p-8">
      <Card className="relative flex max-h-[85vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-card/95 p-0">
        <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-border bg-muted/20 p-6">
          <div className="min-w-0">
            <CardTitle className="text-xl">Scoreboard</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Round {data.series.index}/{data.series.total} · {data.mode.key.replace('_', ' ')}
            </p>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={onClose}>
            <X className="size-5" />
          </Button>
        </CardHeader>
        <CardContent className="overflow-auto p-0">
          <div className="flex min-h-[340px] gap-4 p-6">
            <div className="w-1/2">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-red-500">Red</span>
                  <span className="rounded border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-xs font-semibold text-red-400">
                    {data.series.wins.teamA}
                  </span>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">Player</TableHead>
                    <TableHead>K</TableHead>
                    <TableHead className="text-center">D</TableHead>
                    <TableHead className="text-center">HS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {redPlayers.map((p, idx) => (
                    <TableRow key={p.id} className={p.id === localPlayerId ? 'bg-primary/10' : undefined}>
                      <TableCell className="w-[60px]">
                        <div className="flex items-center gap-3">
                          <div className="shrink-0">
                            <PlayerPortrait image={p.avatar} dead={!p.alive} team={redColor} size={34} showAliveDot />
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-foreground">{p.name ?? `Player ${idx + 1}`}</div>
                            <div className="text-[10px] text-muted-foreground">#{idx + 1}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="tabular-nums">{p.kills}</TableCell>
                      <TableCell className="text-center tabular-nums text-muted-foreground">{p.deaths}</TableCell>
                      <TableCell className="text-center tabular-nums text-muted-foreground">{p.headshots}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="w-1/2">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-blue-500">Blue</span>
                  <span className="rounded border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-400">
                    {data.series.wins.teamB}
                  </span>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">Player</TableHead>
                    <TableHead>K</TableHead>
                    <TableHead className="text-center">D</TableHead>
                    <TableHead className="text-center">HS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bluePlayers.map((p, idx) => (
                    <TableRow key={p.id} className={p.id === localPlayerId ? 'bg-primary/10' : undefined}>
                      <TableCell className="w-[60px]">
                        <div className="flex items-center gap-3">
                          <div className="shrink-0">
                            <PlayerPortrait image={p.avatar} dead={!p.alive} team={blueColor} size={34} showAliveDot />
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-foreground">{p.name ?? `Player ${idx + 1}`}</div>
                            <div className="text-[10px] text-muted-foreground">#{idx + 1}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="tabular-nums">{p.kills}</TableCell>
                      <TableCell className="text-center tabular-nums text-muted-foreground">{p.deaths}</TableCell>
                      <TableCell className="text-center tabular-nums text-muted-foreground">{p.headshots}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
