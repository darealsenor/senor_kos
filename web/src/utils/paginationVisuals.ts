const SLOT_COUNT = 7

export type PaginationVisual = { t: 'page'; n: number } | { t: 'ellipsis' } | { t: 'spacer' }

/**
 * Few total pages: only page buttons (no empty slots). More than 7 pages: always 7 cells so width stays stable while paging.
 */
export function buildPaginationVisuals(totalPages: number, currentPage0: number): PaginationVisual[] {
  if (totalPages <= 1) return []

  const c = currentPage0 + 1

  if (totalPages <= SLOT_COUNT) {
    const out: PaginationVisual[] = []
    for (let i = 1; i <= totalPages; i += 1) out.push({ t: 'page', n: i })
    return out
  }

  if (c <= 4) {
    return [
      { t: 'page', n: 1 },
      { t: 'page', n: 2 },
      { t: 'page', n: 3 },
      { t: 'page', n: 4 },
      { t: 'page', n: 5 },
      { t: 'ellipsis' },
      { t: 'page', n: totalPages },
    ]
  }

  if (c >= totalPages - 3) {
    return [
      { t: 'page', n: 1 },
      { t: 'ellipsis' },
      { t: 'page', n: totalPages - 4 },
      { t: 'page', n: totalPages - 3 },
      { t: 'page', n: totalPages - 2 },
      { t: 'page', n: totalPages - 1 },
      { t: 'page', n: totalPages },
    ]
  }

  return [
    { t: 'page', n: 1 },
    { t: 'ellipsis' },
    { t: 'page', n: c - 1 },
    { t: 'page', n: c },
    { t: 'page', n: c + 1 },
    { t: 'ellipsis' },
    { t: 'page', n: totalPages },
  ]
}
