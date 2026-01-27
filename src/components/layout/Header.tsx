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
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {action}
        <ThemeToggle />
        {user && <UserMenu user={user} />}
      </div>
    </header>
  )
}
