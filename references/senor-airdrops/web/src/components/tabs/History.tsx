import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAtom } from 'jotai'
import { historyAtom } from '@/store/history.state'
import { HistoryEntry } from '@/types'
import { Card, CardContent } from '../ui/card'
import { useState, useMemo, Suspense, lazy } from 'react'
import { IMapMarker } from '../Map/map.marker'
import { Button } from '../ui/button'
import { toMapCoords } from '../Map/map.constants'

const GTAMap = lazy(() => import('../Map/Map'))

const ITEMS_PER_PAGE = 7

export default function History() {
  const [history] = useAtom(historyAtom)
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | undefined>(undefined)
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(history.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentItems = history.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const markers = useMemo<IMapMarker[]>(() => 
    history.map(entry => {
      const [lat, lng] = toMapCoords(entry.drop.coords.x, entry.drop.coords.y)
      return {
        x: entry.drop.coords.x,
        y: entry.drop.coords.y,
        label: `${entry.name} (${entry.gang})`,
        color: 'blue'
      }
    }), [history])

  const formatTimeAgo = (endTime: number) => {
    const now = Date.now()
    const diff = now - endTime
    
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  return (
    <Card>
      <CardContent className="grid grid-cols-[50%_50%] p-0">
        <div className="flex flex-col overflow-y-auto">
          <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Airdrop History</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead>Gang</TableHead>
                  <TableHead>Time Ago</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((entry: HistoryEntry, index: number) => {
                  const [lat, lng] = toMapCoords(entry.drop.coords.x, entry.drop.coords.y)
                  return (
                    <TableRow 
                      key={index}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedLocation([lat, lng])}
                    >
                      <TableCell className="font-medium">{entry.name}</TableCell>
                      <TableCell>{entry.gang}</TableCell>
                      <TableCell>{formatTimeAgo(entry.drop.endTime)}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>

            {totalPages > 1 && (
              <div className="mt-4 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-0">
            <Suspense fallback={<div className="w-full h-full flex items-center justify-center">Loading map...</div>}>
              <GTAMap
                size="small"
                showAirdrops={false}
                autoCenterOnLowestTimeDrop={false}
                center={selectedLocation}
                markers={markers}
              />
            </Suspense>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 