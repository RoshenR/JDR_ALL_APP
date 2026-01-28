'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { updateChatColor } from '@/lib/actions/chat'
import { Palette, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const CHAT_COLORS = [
  { name: 'blue', label: 'Bleu', class: 'bg-blue-500' },
  { name: 'emerald', label: 'Émeraude', class: 'bg-emerald-500' },
  { name: 'violet', label: 'Violet', class: 'bg-violet-500' },
  { name: 'rose', label: 'Rose', class: 'bg-rose-500' },
  { name: 'cyan', label: 'Cyan', class: 'bg-cyan-500' },
  { name: 'orange', label: 'Orange', class: 'bg-orange-500' },
  { name: 'pink', label: 'Pink', class: 'bg-pink-500' },
  { name: 'teal', label: 'Sarcelle', class: 'bg-teal-500' },
]

interface ColorPickerProps {
  currentColor: string | null
  onColorChange?: (color: string | null) => void
}

export function ColorPicker({ currentColor, onColorChange }: ColorPickerProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(currentColor)
  const [isPending, startTransition] = useTransition()

  const handleColorSelect = (color: string | null) => {
    startTransition(async () => {
      const result = await updateChatColor(color)
      if (result.success) {
        setSelectedColor(color)
        onColorChange?.(color)
      }
    })
  }

  const currentColorClass = selectedColor
    ? CHAT_COLORS.find(c => c.name === selectedColor)?.class || 'bg-blue-500'
    : 'bg-gray-400'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          disabled={isPending}
          title="Couleur du chat"
          className="relative"
        >
          <Palette className="h-4 w-4" />
          <span
            className={cn(
              'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background',
              currentColorClass
            )}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-40">
        <DropdownMenuLabel>Ma couleur</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleColorSelect(null)}
          className="flex items-center gap-2 cursor-pointer"
        >
          <span className="w-4 h-4 rounded-full bg-gray-400" />
          <span className="flex-1">Auto</span>
          {selectedColor === null && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        {CHAT_COLORS.map((color) => (
          <DropdownMenuItem
            key={color.name}
            onClick={() => handleColorSelect(color.name)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span className={cn('w-4 h-4 rounded-full', color.class)} />
            <span className="flex-1">{color.label}</span>
            {selectedColor === color.name && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ColorPicker
