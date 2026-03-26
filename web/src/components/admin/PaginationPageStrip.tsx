import {
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationSpacer,
} from '@/components/ui/pagination'
import { buildPaginationVisuals } from '@/utils/paginationVisuals'

interface PaginationPageStripProps {
  idPrefix: string
  totalPages: number
  currentPage: number
  onPageChange: (page: number) => void
}

/**
 * Page numbers between prev/next. Compact when there are ≤7 pages; fixed 7-cell row for larger totals to avoid layout shift.
 */
export function PaginationPageStrip({
  idPrefix,
  totalPages,
  currentPage,
  onPageChange,
}: PaginationPageStripProps) {
  const visuals = buildPaginationVisuals(totalPages, currentPage)

  return (
    <>
      {visuals.map((v, i) => {
        if (v.t === 'spacer') {
          return (
            <PaginationItem key={`${idPrefix}-s-${i}`}>
              <PaginationSpacer />
            </PaginationItem>
          )
        }
        if (v.t === 'ellipsis') {
          return (
            <PaginationItem key={`${idPrefix}-e-${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          )
        }
        const pageIdx = v.n - 1
        return (
          <PaginationItem key={`${idPrefix}-p-${v.n}-${i}`}>
            <PaginationLink
              href="#"
              isActive={pageIdx === currentPage}
              className={pageIdx === currentPage ? '!bg-background !text-foreground' : undefined}
              onClick={(e) => {
                e.preventDefault()
                onPageChange(pageIdx)
              }}
            >
              {v.n}
            </PaginationLink>
          </PaginationItem>
        )
      })}
    </>
  )
}
