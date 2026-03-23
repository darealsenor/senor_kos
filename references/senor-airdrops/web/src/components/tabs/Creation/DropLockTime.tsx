import React from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { IInput } from '@/types'

interface DropLockTimeProps {
  input: IInput
  setInput: React.Dispatch<React.SetStateAction<IInput>>
}

export const DropLockTime: React.FC<DropLockTimeProps> = ({ input, setInput }) => (
  <div className="flex flex-col gap-2">
    <Label htmlFor="lockTime">Lock Time (minutes)</Label>
    <Input
      id="lockTime"
      type="number"
      value={input.lockTime}
      onChange={(e) => setInput((prev) => ({ ...prev, lockTime: Number(e.target.value) }))}
      className="w-[200px]"
      min={0}
    />
  </div>
) 

