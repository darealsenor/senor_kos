import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Airdrop, AirdropSettings } from '@/types'
import { Badge } from '../ui/badge'
import { BoxIcon, ClockIcon, MousePointer, OctagonX, Eye, Keyboard } from 'lucide-react'
import { setWaypoint } from '@/utils/misc'
import { getTimeLeft, formatTime } from '@/utils/GetTimeLeft'
import { toMapCoords } from '@/components/Map/map.constants'
import { useLocale } from '@/providers/LocaleProvider'

interface DropProps extends Airdrop {
  onSelect?: (coords: [number, number]) => void
  onDelete: (drop: Airdrop) => void
  isAdmin: boolean
}

function Drop(props: DropProps) {
  const slicedId = props.id.slice(0, 5)
  const timeLeft = getTimeLeft(props)
  const { t } = useLocale()

  const setDropCoords = (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    setWaypoint({ x: props.coords.x, y: props.coords.y, z: props.coords.z })
    const [lat, lng] = toMapCoords(props.coords.x, props.coords.y)
    props.onSelect?.([lat, lng])
  }

  return (
    <Card className="max-w-52 h-52 flex flex-col justify-between cursor-pointer p-0">
      <CardHeader>
        <CardTitle className="flex gap-1 items-center justify-start">
          <BoxIcon size={12} />
          <p>{t('ui_airdrop')} - {slicedId}</p>
        </CardTitle>
        <CardDescription className="flex gap-1 items-center justify-start">
          <ClockIcon size={12} />
          <p>{t('ui_time_left', formatTime(timeLeft))}</p>
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-wrap gap-1 items-start content-start h-[50%] p-2 overflow-y-auto">
        <Badge variant="secondary">{props.weapons}</Badge>
        <Badge variant="secondary" className="flex items-center gap-1">
          {props.interaction === 'Interaction' && <Eye size={12} />}
          {props.interaction === 'Keystroke' && <Keyboard size={12} />}
          {/* {props.interaction === 'Gulag' && <Users size={12} />} */}
          {props.interaction}
        </Badge>
        {props.settings &&
          (Object.values(props.settings) as AirdropSettings[]).map((key, index) => <Badge key={index}>{key}</Badge>)}
      </CardContent>
      <CardFooter className="flex justify-start gap-2 p-2">
        <Button variant="outline" size="icon" onClick={setDropCoords}>
          <MousePointer />
        </Button>
        <AlertDialog>
          {props.isAdmin && (
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon" onClick={(e: { stopPropagation: () => void }) => e.stopPropagation()}>
                <OctagonX />
              </Button>
            </AlertDialogTrigger>
          )}
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('ui_delete_airdrop_title', slicedId)}</AlertDialogTitle>
              <AlertDialogDescription>{t('ui_delete_airdrop_desc')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('ui_cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e: { stopPropagation: () => void }) => {
                  e.stopPropagation()
                  props.onDelete(props)
                }}
              >
                {t('ui_continue')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  )
}

export default Drop
