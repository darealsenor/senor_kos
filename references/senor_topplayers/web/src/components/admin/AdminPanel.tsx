import React, { useState, useCallback } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import {
  pedsAtom,
  propsAtom,
  propListAtom,
  selectedPedIdAtom,
  selectedPropIdAtom,
  selectedPedAtom,
  selectedPropAtom,
} from '@/store/admin.state'
import { Button } from '@/components/ui/button'
import { fetchNui } from '@/utils/fetchNui'
import { useVisibility } from '@/providers/VisibilityProvider'
import { useLocale } from '@/hooks/useLocale'
import { useDraggable } from '@/hooks/useDraggable'
import { PedsTable } from './PedsTable'
import { PropsTable } from './PropsTable'
import { PedForm } from './PedForm'
import { PropForm } from './PropForm'
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog'
import type { Ped, Prop } from '@/types/admin'

type Tab = 'peds' | 'props'

interface AdminPanelProps {
  tab: Tab
  onTabChange: (tab: Tab) => void
}

function IconClose() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

function IconLock({ locked }: { locked: boolean }) {
  return locked ? (
    <svg width="13" height="14" viewBox="0 0 13 14" fill="none" aria-hidden="true">
      <rect x="1" y="6" width="11" height="7.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.5 6V4a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ) : (
    <svg width="13" height="14" viewBox="0 0 13 14" fill="none" aria-hidden="true">
      <rect x="1" y="6" width="11" height="7.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.5 6V4a3 3 0 0 1 6 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function IconReset() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
      <path
        d="M2 6.5A4.5 4.5 0 1 1 4.5 10.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M2 3.5V6.5H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function AdminPanel({ tab, onTabChange }: AdminPanelProps) {
  const { t, appTitle } = useLocale()
  const { visible } = useVisibility()
  const peds = useAtomValue(pedsAtom)
  const props = useAtomValue(propsAtom)
  const propList = useAtomValue(propListAtom)
  const selectedPedId = useAtomValue(selectedPedIdAtom)
  const selectedPropId = useAtomValue(selectedPropIdAtom)
  const selectedPed = useAtomValue(selectedPedAtom)
  const selectedProp = useAtomValue(selectedPropAtom)
  const setPeds = useSetAtom(pedsAtom)
  const setProps = useSetAtom(propsAtom)
  const setSelectedPedId = useSetAtom(selectedPedIdAtom)
  const setSelectedPropId = useSetAtom(selectedPropIdAtom)

  const [deleteTarget, setDeleteTarget] = useState<Ped | Prop | null>(null)

  const { panelRef, style, locked, toggleLock, resetPosition, onMouseDown } = useDraggable(true)

  const handleClose = useCallback(() => {
    fetchNui('hideFrame')
  }, [])

  const handleSavePed = useCallback(
    (result?: { peds?: Ped[]; props?: Prop[] }) => {
      if (result?.peds) setPeds(result.peds)
      if (result?.props) setProps(result.props)
      setSelectedPedId(null)
    },
    [setPeds, setProps, setSelectedPedId]
  )

  const handleSaveProp = useCallback(
    (result?: { peds?: Ped[]; props?: Prop[] }) => {
      if (result?.peds) setPeds(result.peds)
      if (result?.props) setProps(result.props)
      setSelectedPropId(null)
    },
    [setPeds, setProps, setSelectedPropId]
  )

  const handleDeletePed = useCallback(
    async (ped: Ped) => {
      const result = await fetchNui<{ success: boolean; peds?: Ped[]; props?: Prop[] }>(
        'senor_topplayers:deletePed',
        { id: ped.id }
      )
      if (result?.success) {
        if (result.peds) setPeds(result.peds)
        if (result.props) setProps(result.props)
        setSelectedPedId(null)
      }
      setDeleteTarget(null)
    },
    [setPeds, setProps, setSelectedPedId]
  )

  const handleDeleteProp = useCallback(
    async (prop: Prop) => {
      const result = await fetchNui<{ success: boolean; peds?: Ped[]; props?: Prop[] }>(
        'senor_topplayers:deleteProp',
        { id: prop.id }
      )
      if (result?.success) {
        if (result.peds) setPeds(result.peds)
        if (result.props) setProps(result.props)
        setSelectedPropId(null)
      }
      setDeleteTarget(null)
    },
    [setPeds, setProps, setSelectedPropId]
  )

  if (!visible) return null

  return (
    <>
      <div
        ref={panelRef}
        className="fixed right-2 top-1/2 z-50 flex w-[300px] max-h-[85vh] -translate-y-1/2 flex-col rounded-lg border border-border bg-card shadow-lg overflow-hidden"
        style={style}
      >
        <div
          className={`flex shrink-0 items-center justify-between border-b border-border px-2 py-1.5 ${!locked ? 'cursor-grab active:cursor-grabbing' : ''}`}
          onMouseDown={onMouseDown}
        >
          <h1 className="text-sm font-semibold text-foreground select-none">
            {appTitle} <span className="text-primary">{t('admin')}</span>
          </h1>
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 shrink-0 hover:bg-primary/10 ${locked ? 'text-primary hover:text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={toggleLock}
              aria-label={locked ? 'Unlock position' : 'Lock position'}
              title={locked ? 'Unlock position' : 'Lock position'}
            >
              <IconLock locked={locked} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 text-muted-foreground hover:bg-primary/10 hover:text-foreground"
              onClick={resetPosition}
              aria-label="Reset position"
              title="Reset position"
            >
              <IconReset />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 hover:bg-primary/10 hover:text-primary"
              onClick={handleClose}
              aria-label={t('close')}
              title={t('close')}
            >
              <IconClose />
            </Button>
          </div>
        </div>

        <div className="flex gap-0.5 border-b border-border px-1 py-1">
          <Button
            variant={tab === 'peds' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 flex-1 text-xs hover:bg-primary/10 hover:text-primary"
            onClick={() => onTabChange('peds')}
          >
            {t('peds')}
          </Button>
          <Button
            variant={tab === 'props' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 flex-1 text-xs hover:bg-primary/10 hover:text-primary"
            onClick={() => onTabChange('props')}
          >
            {t('props')}
          </Button>
        </div>

        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {tab === 'peds' ? (
            <>
              <div className="shrink-0 flex items-center justify-between px-3 pt-2 pb-1">
                <span className="text-xs font-medium text-muted-foreground">{t('list')}</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-xs hover:border-primary hover:bg-primary/10"
                  onClick={() => {
                    setSelectedPropId(null)
                    setSelectedPedId(null)
                    onTabChange('peds')
                  }}
                >
                  {t('add_ped')}
                </Button>
              </div>
              <div className="min-h-[200px] flex-[2] overflow-y-auto overflow-x-hidden px-3 py-2">
                <PedsTable
                  peds={peds}
                  selectedId={selectedPedId}
                  onSelect={(p) => setSelectedPedId(p.id)}
                  onDelete={(p) => setDeleteTarget(p)}
                />
              </div>
              <div className="min-h-0 flex-1 border-t border-border overflow-y-auto overflow-x-hidden p-3">
                <PedForm
                  key={selectedPed?.id ?? 'new'}
                  ped={selectedPed}
                  onSave={handleSavePed}
                  onCancel={() => setSelectedPedId(null)}
                />
              </div>
            </>
          ) : (
            <>
              <div className="shrink-0 flex items-center justify-between px-3 pt-2 pb-1">
                <span className="text-xs font-medium text-muted-foreground">{t('list')}</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-xs hover:border-primary hover:bg-primary/10"
                  onClick={() => {
                    setSelectedPedId(null)
                    setSelectedPropId(null)
                    onTabChange('props')
                  }}
                >
                  {t('add_prop')}
                </Button>
              </div>
              <div className="min-h-[200px] flex-[2] overflow-y-auto overflow-x-hidden px-3 py-2">
                <PropsTable
                  props={props}
                  propList={propList}
                  selectedId={selectedPropId}
                  onSelect={(p) => setSelectedPropId(p.id)}
                  onDelete={(p) => setDeleteTarget(p)}
                />
              </div>
              <div className="min-h-0 flex-1 border-t border-border overflow-y-auto overflow-x-hidden p-3">
                <PropForm
                  key={selectedProp?.id ?? 'new'}
                  prop={selectedProp}
                  onSave={handleSaveProp}
                  onCancel={() => setSelectedPropId(null)}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t('delete_confirm')}
        description={
          deleteTarget
            ? 'category' in deleteTarget
              ? t('delete_ped_confirm', String((deleteTarget as Ped).id), (deleteTarget as Ped).category)
              : t('delete_prop_confirm', String((deleteTarget as Prop).id))
            : undefined
        }
        onConfirm={() => {
          if (!deleteTarget) return
          if ('category' in deleteTarget) handleDeletePed(deleteTarget)
          else handleDeleteProp(deleteTarget)
        }}
      />
    </>
  )
}
