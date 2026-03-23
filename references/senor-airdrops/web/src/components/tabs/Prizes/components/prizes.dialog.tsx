import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { PrizeWithId } from '@/types'

interface EditPrizeDialogProps {
  prize: PrizeWithId
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (prize: PrizeWithId) => void
}

const EditPrizeDialog: React.FC<EditPrizeDialogProps> = ({
  prize,
  open,
  onOpenChange,
  onSave,
}) => {
  const [editedPrize, setEditedPrize] = useState<PrizeWithId>(prize)
  const [amountError, setAmountError] = useState('')

  const validateAmount = (amount: number) => {
    if (isNaN(amount) || amount < 1) return 'Amount must be a positive number'
    return ''
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10)
    setAmountError(validateAmount(value))
    setEditedPrize({ ...editedPrize, amount: value })
  }

  const handleSave = () => {
    if (amountError) return
    onSave(editedPrize)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Prize</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Display label as read-only */}
          <div className="space-y-1">
            <Label>Item Label</Label>
            <div className="border rounded px-3 py-2 text-muted-foreground bg-muted/50">
              {prize.label}
            </div>
          </div>

          {/* Editable amount */}
          <div className="space-y-2">
            <Label>Amount</Label>
            <Input
              type="number"
              value={editedPrize.amount}
              onChange={handleAmountChange}
              placeholder="Enter amount"
              className='text-foreground'
            />
            {amountError && <p className="text-sm text-red-500">{amountError}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!!amountError}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default EditPrizeDialog
