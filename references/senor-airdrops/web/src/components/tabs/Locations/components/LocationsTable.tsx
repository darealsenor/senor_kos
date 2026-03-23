import React, { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from 'lucide-react'
import EditLocationDialog from './EditLocationDialog'

interface Location {
  id: number
  name: string
  coords: {
    x: number
    y: number
    z: number
  }
}

interface LocationsTableProps {
  locations: Location[]
  onEdit: (location: Location) => void
  onDelete: (location: Location) => void
  onRowClick: (location: Location) => void
}

const ITEMS_PER_PAGE = 7

const LocationsTable: React.FC<LocationsTableProps> = ({ locations, onEdit, onDelete, onRowClick }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const totalPages = Math.ceil(locations.length / ITEMS_PER_PAGE)
  
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentItems = locations.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleEditClick = (location: Location) => {
    setEditingLocation(location)
  }

  const handleSaveEdit = (location: Location) => {
    onEdit(location)
    setEditingLocation(null)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Coordinates</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.map((location) => (
              <TableRow 
                key={location.id}
                className="cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={() => onRowClick(location)}
              >
                <TableCell className="font-medium">{location.name}</TableCell>
                <TableCell>
                  {`vector3(${location.coords.x.toFixed(2)}, ${location.coords.y.toFixed(2)}, ${location.coords.z.toFixed(2)})`}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditClick(location)
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(location)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 && (
        <div className="mt-auto pt-4 flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
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
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
      {editingLocation && (
        <EditLocationDialog
          location={editingLocation}
          open={!!editingLocation}
          onOpenChange={(open) => !open && setEditingLocation(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  )
}

export default LocationsTable 