import * as React from 'react'

import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'

import { cn } from '@/lib/utils'

type PaginationElementProps = {
  isActive?: boolean
}

const Pagination = React.forwardRef<HTMLElement, React.ComponentPropsWithoutRef<'nav'>>(({ className, ...props }, ref) => (
  <nav ref={ref} aria-label="pagination" className={cn('mx-auto flex w-full justify-center', className)} {...props} />
))
Pagination.displayName = 'Pagination'

const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentPropsWithoutRef<'ul'>>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={cn('flex flex-row items-center gap-1', className)} {...props} />
  )
)
PaginationContent.displayName = 'PaginationContent'

const PaginationItem = React.forwardRef<HTMLLIElement, React.ComponentPropsWithoutRef<'li'>>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn('inline-flex', className)} {...props} />
))
PaginationItem.displayName = 'PaginationItem'

const PaginationLink = React.forwardRef<HTMLAnchorElement, React.ComponentPropsWithoutRef<'a'> & PaginationElementProps>(
  ({ className, isActive, ...props }, ref) => (
    <a
      ref={ref}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background px-0 text-sm font-medium tabular-nums',
        'transition-colors hover:bg-accent hover:text-accent-foreground',
        isActive && 'bg-primary text-primary-foreground',
        className
      )}
      {...props}
    />
  )
)
PaginationLink.displayName = 'PaginationLink'

const PaginationPrevious = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<'a'> & PaginationElementProps & { disabled?: boolean }
>(({ className, isActive, disabled, ...props }, ref) => (
  <a
    ref={ref}
    aria-disabled={disabled}
    className={cn(
      'inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium',
      'transition-colors hover:bg-accent hover:text-accent-foreground',
      disabled && 'pointer-events-none opacity-50',
      isActive && 'bg-primary text-primary-foreground',
      className
    )}
    {...props}
  >
    <ChevronLeft className="size-4" />
    <span className="sr-only">Previous</span>
  </a>
))
PaginationPrevious.displayName = 'PaginationPrevious'

const PaginationNext = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<'a'> & PaginationElementProps & { disabled?: boolean }
>(({ className, isActive, disabled, ...props }, ref) => (
  <a
    ref={ref}
    aria-disabled={disabled}
    className={cn(
      'inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium',
      'transition-colors hover:bg-accent hover:text-accent-foreground',
      disabled && 'pointer-events-none opacity-50',
      isActive && 'bg-primary text-primary-foreground',
      className
    )}
    {...props}
  >
    <ChevronRight className="size-4" />
    <span className="sr-only">Next</span>
  </a>
))
PaginationNext.displayName = 'PaginationNext'

const PaginationEllipsis = React.forwardRef<HTMLSpanElement, React.ComponentPropsWithoutRef<'span'>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn('inline-flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background', className)}
      {...props}
    >
      <MoreHorizontal className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  )
)
PaginationEllipsis.displayName = 'PaginationEllipsis'

const PaginationSpacer = React.forwardRef<HTMLSpanElement, React.ComponentPropsWithoutRef<'span'>>(
  ({ className, ...props }, ref) => (
    <span ref={ref} className={cn('inline-flex h-9 w-9 shrink-0', className)} aria-hidden {...props} />
  )
)
PaginationSpacer.displayName = 'PaginationSpacer'

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationSpacer,
}

