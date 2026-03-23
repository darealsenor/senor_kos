import { atom } from 'jotai'
import type { Ped, Prop } from '@/types/admin'

export interface AnimPreset {
  id: string
  label: string
  dict: string
  anim: string
  flag?: number
}

export const pedsAtom = atom<Ped[]>([])
export interface PropOption {
  model: string
  label: string
}

export const propListAtom = atom<PropOption[]>([])
export const animPresetsAtom = atom<AnimPreset[]>([])

export const propsAtom = atom<Prop[]>([])

export const selectedPedIdAtom = atom<number | null>(null)

export const selectedPropIdAtom = atom<number | null>(null)

export const pedFormOpenAtom = atom<boolean>(false)

export const propFormOpenAtom = atom<boolean>(false)

export const selectedPedAtom = atom<Ped | null>((get) => {
  const peds = get(pedsAtom)
  const id = get(selectedPedIdAtom)
  if (id == null) return null
  return peds.find((p) => p.id === id) ?? null
})

export const selectedPropAtom = atom<Prop | null>((get) => {
  const props = get(propsAtom)
  const id = get(selectedPropIdAtom)
  if (id == null) return null
  return props.find((p) => p.id === id) ?? null
})
