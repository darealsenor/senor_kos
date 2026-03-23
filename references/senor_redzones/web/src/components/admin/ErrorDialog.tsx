import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ErrorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  message: string
}

export const ErrorDialog = ({ open, onOpenChange, message }: ErrorDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="text-red-400">Error</DialogTitle>
      </DialogHeader>
      <p className="text-sm text-white/80">{message}</p>
      <DialogFooter>
        <Button
          type="button"
          onClick={() => onOpenChange(false)}
          className="bg-rz-primary hover:bg-rz-primary/80 text-white"
        >
          OK
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)
