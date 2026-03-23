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
import CoordSelector from '@/components/shared/CoordSelector'

interface Location {
  id: number
  name: string
  coords: {
    x: number
    y: number
    z: number
  }
}

interface EditLocationDialogProps {
  location: Location
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (location: Location) => void
}

const EditLocationDialog: React.FC<EditLocationDialogProps> = ({
  location,
  open,
  onOpenChange,
  onSave,
}) => {
  const [editedLocation, setEditedLocation] = useState<Location>(location)
  const [nameError, setNameError] = useState<string>('')

  const validateName = (name: string) => {
    if (name.length < 3) {
      return 'Name must be at least 3 characters long'
    }
    if (name.length > 16) {
      return 'Name must be at most 16 characters long'
    }
    return ''
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value
    const error = validateName(newName)
    setNameError(error)
    setEditedLocation({ ...editedLocation, name: newName })
  }

  const handleSave = () => {
    if (nameError) return
    onSave(editedLocation)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Location</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Location Name</Label>
            <Input
              value={editedLocation.name}
              onChange={handleNameChange}
              placeholder="Enter location name"
            />
            {nameError && <p className="text-sm text-red-500">{nameError}</p>}
          </div>
          <CoordSelector
            coords={editedLocation.coords}
            onCoordsChange={(coords) =>
              setEditedLocation({ ...editedLocation, coords })
            }
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!!nameError}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default EditLocationDialog 