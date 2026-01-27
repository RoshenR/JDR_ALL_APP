'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Shield, User, Trash2 } from 'lucide-react'
import { updateUserRole, deleteUser } from '@/lib/actions/auth'
import type { UserRole } from '@/lib/actions/auth'

interface UserData {
  id: string
  email: string
  name: string
  role: string
  createdAt: Date
}

interface UserManagementProps {
  users: UserData[]
  currentUserId: string
}

export function UserManagement({ users, currentUserId }: UserManagementProps) {
  const router = useRouter()

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    await updateUserRole(userId, newRole)
    router.refresh()
  }

  const handleDelete = async (userId: string, userName: string) => {
    if (confirm(`Supprimer l'utilisateur ${userName} ? Cette action est irréversible.`)) {
      await deleteUser(userId)
      router.refresh()
    }
  }

  return (
    <div className="space-y-2">
      {users.map((u) => (
        <div
          key={u.id}
          className="flex items-center justify-between p-4 rounded-lg border"
        >
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${u.role === 'MJ' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              {u.role === 'MJ' ? (
                <Shield className="h-5 w-5" />
              ) : (
                <User className="h-5 w-5" />
              )}
            </div>
            <div>
              <p className="font-medium">{u.name}</p>
              <p className="text-sm text-muted-foreground">{u.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-sm px-2 py-1 rounded ${u.role === 'MJ' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
              {u.role === 'MJ' ? 'Maître du Jeu' : 'Joueur'}
            </span>

            {u.id !== currentUserId && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRoleChange(u.id, u.role === 'MJ' ? 'PLAYER' : 'MJ')}
                >
                  {u.role === 'MJ' ? 'Rétrograder' : 'Promouvoir MJ'}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(u.id, u.name)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}

            {u.id === currentUserId && (
              <span className="text-xs text-muted-foreground">(vous)</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
