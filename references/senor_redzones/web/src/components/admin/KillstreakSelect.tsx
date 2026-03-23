import { useState } from 'react'
import type { Zone, KillstreakReward } from '@/types'
import { LoadoutItem } from './LoadoutSelect'
import { ItemSearchInput } from './ItemSearchInput'

interface KillstreakSelectProps {
  killstreaks: Zone['killstreaks']
  loadoutItems: LoadoutItem[]
  onChange: (killstreaks: Zone['killstreaks']) => void
}

function toEntries(killstreaks: Zone['killstreaks']): Array<{ kills: number; reward: KillstreakReward }> {
  if (!killstreaks || typeof killstreaks !== 'object') return []
  return Object.entries(killstreaks)
    .filter(([, v]) => v && typeof v === 'object' && (v as KillstreakReward).type && (v as KillstreakReward).amount != null)
    .map(([k, v]) => ({ kills: parseInt(k, 10) || 0, reward: v as KillstreakReward }))
    .filter((e) => e.kills > 0)
    .sort((a, b) => a.kills - b.kills)
}

export const KillstreakSelect = ({ killstreaks, loadoutItems, onChange }: KillstreakSelectProps) => {
  const [kills, setKills] = useState('')
  const [rewardType, setRewardType] = useState<'item' | 'money'>('item')
  const [itemName, setItemName] = useState('')
  const [amount, setAmount] = useState('1')
  const [account, setAccount] = useState('cash')

  const entries = toEntries(killstreaks)
  const getItemLabel = (name: string) => loadoutItems.find((i) => i.name === name)?.label ?? name

  const addReward = () => {
    const k = parseInt(kills, 10)
    if (!k || k < 1) return
    const amt = parseInt(amount, 10) || 1
    if (amt < 1) return

    const reward: KillstreakReward =
      rewardType === 'item'
        ? { type: 'item', name: itemName || undefined, amount: amt }
        : { type: 'money', amount: amt, account }
    if (rewardType === 'item' && !itemName.trim()) return

    const next = { ...killstreaks, [k]: reward }
    onChange(next)
    setKills('')
    setItemName('')
    setAmount('1')
  }

  const removeReward = (killCount: number) => {
    const next = { ...killstreaks }
    delete next[killCount]
    delete next[String(killCount)]
    onChange(next)
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm text-white/80 font-medium">Killstreak rewards</label>
      <p className="text-xs text-white/50">Rewards given at specific kill counts</p>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-[10px] text-white/50 uppercase">Kills</span>
          <input
            type="number"
            min={1}
            value={kills}
            onChange={(e) => setKills(e.target.value)}
            placeholder="3"
            className="w-full sm:w-20 bg-black/40 border border-rz-primary/30 rounded px-2 py-2 text-white text-sm focus:outline-none focus:border-rz-primary"
          />
        </div>
        <div className="flex flex-col gap-1 min-w-0 sm:min-w-[80px]">
          <span className="text-[10px] text-white/50 uppercase">Type</span>
          <select
            value={rewardType}
            onChange={(e) => {
              setRewardType(e.target.value as 'item' | 'money')
              setItemName('')
            }}
            className="w-full bg-black/40 border border-rz-primary/30 rounded px-2 py-2 text-white text-sm focus:outline-none focus:border-rz-primary"
          >
            <option value="item" className="bg-black text-white">Item</option>
            <option value="money" className="bg-black text-white">Money</option>
          </select>
        </div>
        {rewardType === 'item' && (
          <div className="flex flex-col gap-1 flex-1 min-w-0 sm:min-w-[140px]">
            <span className="text-[10px] text-white/50 uppercase">Item</span>
            <ItemSearchInput
              loadoutItems={loadoutItems}
              value={itemName}
              onChange={setItemName}
              placeholder="Search items..."
              className="min-w-0"
            />
          </div>
        )}
        {rewardType === 'money' && (
          <div className="flex flex-col gap-1 min-w-0 sm:min-w-[80px]">
            <span className="text-[10px] text-white/50 uppercase">Account</span>
            <select
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              className="w-full bg-black/40 border border-rz-primary/30 rounded px-2 py-2 text-white text-sm focus:outline-none focus:border-rz-primary"
            >
              <option value="cash" className="bg-black text-white">Cash</option>
              <option value="bank" className="bg-black text-white">Bank</option>
            </select>
          </div>
        )}
        <div className="flex flex-col gap-1 min-w-0 sm:w-20">
          <span className="text-[10px] text-white/50 uppercase">Amount</span>
          <input
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-black/40 border border-rz-primary/30 rounded px-2 py-2 text-white text-sm focus:outline-none focus:border-rz-primary"
          />
        </div>
        <button
          type="button"
          onClick={addReward}
          className="px-3 py-2 bg-rz-primary/20 border border-rz-primary/40 hover:bg-rz-primary/30 rounded text-white text-sm font-medium uppercase tracking-wider self-end"
        >
          Add
        </button>
      </div>
      {entries.length > 0 && (
        <ul className="flex flex-col gap-1 max-h-32 overflow-y-auto">
          {entries.map(({ kills: k, reward }) => {
            const label =
              reward.type === 'item'
                ? `${getItemLabel(reward.name ?? '')} x${reward.amount}`
                : `$${reward.amount} (${reward.account ?? 'cash'})`
            return (
              <li
                key={k}
                className="flex items-center justify-between gap-2 py-1 px-2 bg-black/30 rounded border border-rz-primary/10"
              >
                <span className="text-sm text-white/90 truncate flex-1">
                  {k} kills → {label}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => removeReward(k)}
                    className="px-2 py-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded"
                  >
                    Remove
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
