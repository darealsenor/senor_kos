import React, { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2 } from 'lucide-react'
import { PrizeWithId } from '@/types'
import EditPrizeDialog from './prizes.dialog'

interface PrizesTableProps {
  prizes: PrizeWithId[]
  onEdit: (prize: PrizeWithId) => void
  onDelete: (prize: PrizeWithId) => void
}

const ITEMS_PER_PAGE = 7

const PrizesItemTable: React.FC<PrizesTableProps> = ({ prizes, onEdit, onDelete }) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [editingPrize, setEditingPrize] = useState<PrizeWithId | null>(null)

  const totalPages = Math.ceil(prizes.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentItems = prizes.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleEditClick = (prize: PrizeWithId) => {
    setEditingPrize(prize)
  }

  const handleSaveEdit = (updated: PrizeWithId) => {
    onEdit(updated)
    setEditingPrize(null)
  }

  if (!prizes.length) {
    return <div className="text-center text-muted-foreground py-6 text-sm">No prize items available.</div>
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.map((prize) => {
              return (
                <TableRow key={prize.id}>
                  <TableCell className="font-medium">{prize.name}</TableCell>
                  <TableCell>{prize.amount}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(prize)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(prize)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="mt-auto pt-4 flex items-center gap-2">
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

      {/* Edit Dialog */}
      {editingPrize && (
        <EditPrizeDialog
          prize={editingPrize}
          open={!!editingPrize}
          onOpenChange={(open) => !open && setEditingPrize(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  )
}

export default PrizesItemTable
