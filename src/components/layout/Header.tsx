import { ThemeToggle } from './ThemeToggle'
import { UserMenu } from '@/components/auth/UserMenu'
import type { SessionUser } from '@/lib/actions/auth'

interface HeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
  user?: SessionUser | null
}

export function Header({ title, description, action, user }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 sm:h-16 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Left side with title - extra padding on mobile for burger menu */}
      <div className="min-w-0 flex-1 pl-14 pr-2 md:pl-6">
        <h1 className="text-sm sm:text-xl font-semibold truncate">{title}</h1>
        {description && (
          <p className="text-xs sm:text-sm text-muted-foreground truncate">{description}</p>
        )}
      </div>
      {/* Right side with actions */}
      <div className="flex items-center gap-1 sm:gap-2 pr-3 sm:pr-6 shrink-0">
        {action}
        <ThemeToggle />
        {user && <UserMenu user={user} />}
      </div>
    </header>
  )
}
