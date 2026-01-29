'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Users,
  Sword,
  Swords,
  BookOpen,
  Home,
  Menu,
  X,
  Dices,
  Package,
  MessagesSquare
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Personnages', href: '/characters', icon: Users },
  { name: 'Campagnes', href: '/campaigns', icon: Sword },
  { name: 'Groupes', href: '/groups', icon: MessagesSquare },
  { name: 'Combat', href: '/combat', icon: Swords },
  { name: 'Dés', href: '/dice', icon: Dices },
  { name: 'Loot', href: '/loot', icon: Package },
  { name: 'Wiki', href: '/wiki', icon: BookOpen },
]

export function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button - positioned in header area */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-2 left-2 z-40 h-10 w-10 md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen w-64 border-r bg-background transition-transform duration-300 ease-in-out md:z-40 md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-14 sm:h-16 items-center justify-between border-b px-4">
          <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
            <Sword className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">JDR Manager</span>
          </Link>
          {/* Close button inside sidebar on mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 md:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex flex-col gap-1 p-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
