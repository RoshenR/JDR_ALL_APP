'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { WIKI_CATEGORIES } from '@/types'
import { MapPin, Users, Package, ScrollText } from 'lucide-react'

const categoryIcons = {
  locations: MapPin,
  npcs: Users,
  items: Package,
  lore: ScrollText,
}

export function CategoryNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-wrap gap-2">
      <Link
        href="/wiki"
        className={cn(
          'inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          pathname === '/wiki'
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted hover:bg-accent'
        )}
      >
        Tous
      </Link>
      {Object.entries(WIKI_CATEGORIES).map(([key, { label }]) => {
        const Icon = categoryIcons[key as keyof typeof categoryIcons]
        const isActive = pathname === `/wiki/${key}`
        return (
          <Link
            key={key}
            href={`/wiki/${key}`}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-accent'
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
