import React, { useCallback, useState } from 'react'
import { useSetAtom } from 'jotai'
import { useNuiEvent } from '../hooks/useNuiEvent'
import { useVisibility } from '../providers/VisibilityProvider'
import { AdminPanel } from './admin/AdminPanel'
import { PlacementHelpBar } from './admin/PlacementHelpBar'
import { LeaderboardView } from './leaderboard/LeaderboardView'
import { pedsAtom, propsAtom, propListAtom, animPresetsAtom } from '../store/admin.state'
import type { PropOption } from '../store/admin.state'
import { configAtom } from '../store/config.state'
import { applyTheme } from '../lib/themes'

function normalizePropList(raw: unknown): PropOption[] {
  if (!Array.isArray(raw)) return []
  return raw.map((item): PropOption => {
    if (item != null && typeof item === 'object' && 'model' in item) {
      const o = item as { model?: unknown; label?: unknown }
      const model = typeof o.model === 'string' ? o.model : ''
      const label = typeof o.label === 'string' ? o.label : model
      return { model, label }
    }
    if (typeof item === 'string') return { model: item, label: item }
    return { model: '', label: '' }
  }).filter((o) => o.model !== '')
}

interface SetAdminDataPayload {
  peds?: Array<{
    id: number
    coords: { x: number; y: number; z: number; w: number }
    category: string
    categoryRanking: number
    text: string | null
    enabled: boolean
  }>
  props?: Array<{
    id: number
    coords: { x: number; y: number; z: number; w: number }
    prop: string | null
    label?: string | null
    enabled: boolean
  }>
  propList?: unknown
  animPresets?: Array<{ id: string; label: string; dict: string; anim: string; flag?: number }>
}

const App: React.FC = () => {
  const visible = useVisibility().visible
  const [placementActive, setPlacementActive] = useState(false)
  const [leaderboardOpen, setLeaderboardOpen] = useState(false)
  const [adminTab, setAdminTab] = useState<'peds' | 'props'>('peds')
  const setPeds = useSetAtom(pedsAtom)
  const setProps = useSetAtom(propsAtom)
  const setPropList = useSetAtom(propListAtom)
  const setAnimPresets = useSetAtom(animPresetsAtom)
  const setConfig = useSetAtom(configAtom)

  useNuiEvent<{ locale: Record<string, string>; theme?: string; appTitle?: string }>(
    'senor_topplayers:config',
    (data) => {
      setConfig({
        locale: data?.locale ?? {},
        appTitle: data?.appTitle ?? 'Top Players',
        theme: data?.theme,
      })
      applyTheme(data?.theme)
    }
  )
  useNuiEvent<boolean>('setPlacementActive', (data) => setPlacementActive(!!data))
  useNuiEvent<boolean>('setLeaderboardOpen', (data) => setLeaderboardOpen(!!data))

  const handleAdminData = useCallback(
    (data: SetAdminDataPayload) => {
      if (data.peds) setPeds(data.peds)
      if (data.props) setProps(data.props)
      setPropList(normalizePropList(data.propList))
      if (data.animPresets) setAnimPresets(data.animPresets)
    },
    [setPeds, setProps, setPropList, setAnimPresets]
  )

  useNuiEvent<SetAdminDataPayload>('setAdminData', handleAdminData)

  if (!visible) return null

  return (
    <>
      {placementActive && <PlacementHelpBar />}
      <div
        className="h-full w-full"
        style={{
          display: placementActive ? 'none' : undefined,
        }}
      >
        {leaderboardOpen ? <LeaderboardView /> : <AdminPanel tab={adminTab} onTabChange={setAdminTab} />}
      </div>
    </>
  )
}

export default App
