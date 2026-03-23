'use client'

import { useMemo, useState } from 'react'
import { InventoryItem, Prize, PrizeWithId } from '@/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown } from 'lucide-react'
import { useLocale } from '@/providers/LocaleProvider'

interface IAddItem {
  inventoryItems: InventoryItem[]
  prizes?: PrizeWithId[]
  handlePrizeAdd: (Prize: Prize) => void
}

function AddItemPrizes({ inventoryItems, prizes = [], handlePrizeAdd }: IAddItem) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<InventoryItem | null>(null)
  const [amount, setAmount] = useState('')
  const { t } = useLocale()

  const availableItems = useMemo(() => {
    const usedNames = new Set(prizes.map((p) => p.name))
    return inventoryItems.filter((item) => !usedNames.has(item.name))
  }, [inventoryItems, prizes])

  const onSubmit = () => {
    if (!selected || !amount || isNaN(Number(amount))) return

    handlePrizeAdd({
      name: selected.name,
      label: selected.label,
      amount: parseInt(amount, 10),
    })

    setSelected(null)
    setAmount('')
  }

  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-semibold">{t('ui_add_new_item')}</h2>

      <div className="flex flex-wrap items-center gap-2">
        {/* Combobox */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" role="combobox" aria-expanded={open} className="w-[200px] justify-between">
              {selected ? selected.label : t('ui_select_item')}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0 max-h-60 overflow-y-auto">
            <Command>
              <CommandInput placeholder={t('ui_search_item')} />
              <CommandEmpty>{t('ui_no_item_found')}</CommandEmpty>
              <CommandGroup>
                {availableItems.map((item) => (
                  <CommandItem
                    key={item.name}
                    onSelect={() => {
                      setSelected(item)
                      setOpen(false)
                    }}
                  >
                    <Check className={cn('mr-2 h-4 w-4', selected?.name === item.name ? 'opacity-100' : 'opacity-0')} />
                    {item.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Amount input */}
        <Input
          type="number"
          placeholder={t('ui_amount')}
          className="w-[100px]"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        {/* Submit */}
        <Button onClick={onSubmit} disabled={!selected || !amount || isNaN(Number(amount))}>
          {t('ui_add')}
        </Button>
      </div>
    </div>
  )
}

export default AddItemPrizes
