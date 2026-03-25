import { fetchNui } from '@/utils/fetchNui'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface AdminPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Placeholder admin shell until server-backed actions are wired.
 */
export function AdminPanel({ open, onOpenChange }: AdminPanelProps) {
  const requestClose = () => {
    if (!open) return
    onOpenChange(false)
    fetchNui('hideFrame')
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) requestClose()
      }}
    >
      <DialogContent className="pointer-events-auto z-admin sm:max-w-md">
        <DialogHeader>
          <DialogTitle>KOS Admin</DialogTitle>
          <DialogDescription>
            Match setup and moderation tools will connect here next. Use Escape or Close to return to the game.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="secondary" onClick={requestClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
