'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User, LogOut, Shield, Settings } from 'lucide-react'
import { logout } from '@/lib/actions/auth'
import type { SessionUser } from '@/lib/actions/auth'
import Link from 'next/link'

interface UserMenuProps {
  user: SessionUser
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <div className={`flex h-7 w-7 items-center justify-center rounded-full ${user.role === 'MJ' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
            {user.role === 'MJ' ? (
              <Shield className="h-4 w-4" />
            ) : (
              <User className="h-4 w-4" />
            )}
          </div>
          <span className="hidden sm:inline">{user.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span>{user.name}</span>
            <span className="text-xs text-muted-foreground">{user.email}</span>
            <span className={`text-xs mt-1 ${user.role === 'MJ' ? 'text-primary' : 'text-muted-foreground'}`}>
              {user.role === 'MJ' ? 'Maître du Jeu' : 'Joueur'}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {user.role === 'MJ' && (
          <DropdownMenuItem asChild>
            <Link href="/admin/users">
              <Settings className="mr-2 h-4 w-4" />
              Gérer les utilisateurs
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          Se déconnecter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
