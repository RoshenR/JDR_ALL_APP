'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  searchUsers,
  addGroupMember,
  removeGroupMember,
  updateMemberRole
} from '@/lib/actions/groups'
import type { GroupMemberRecord } from '@/lib/group-types'
import {
  Crown,
  UserMinus,
  UserPlus,
  Search,
  Loader2,
  Shield,
  User
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface MemberManagerProps {
  groupId: string
  members: GroupMemberRecord[]
  currentUserId: string
  isAdmin: boolean
}

export function MemberManager({
  groupId,
  members,
  currentUserId,
  isAdmin
}: MemberManagerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Array<{ id: string; name: string; email: string }>>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async (query: string) => {
    setSearchQuery(query)

    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    const results = await searchUsers(query, groupId)
    setSearchResults(results)
    setIsSearching(false)
  }

  const handleAddMember = (userId: string) => {
    setError(null)
    startTransition(async () => {
      const result = await addGroupMember(groupId, userId)
      if (!result.success) {
        setError(result.error || 'Erreur')
      } else {
        setSearchQuery('')
        setSearchResults([])
      }
    })
  }

  const handleRemoveMember = (userId: string) => {
    setError(null)
    startTransition(async () => {
      const result = await removeGroupMember(groupId, userId)
      if (!result.success) {
        setError(result.error || 'Erreur')
      }
    })
  }

  const handleRoleChange = (userId: string, newRole: 'admin' | 'member') => {
    setError(null)
    startTransition(async () => {
      const result = await updateMemberRole(groupId, userId, newRole)
      if (!result.success) {
        setError(result.error || 'Erreur')
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Ajout de membres */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Ajouter un membre
            </CardTitle>
            <CardDescription>
              Recherchez un utilisateur par nom ou email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Rechercher un utilisateur..."
                  className="pl-10"
                  disabled={isPending}
                />
              </div>

              {isSearching && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              )}

              {searchResults.length > 0 && (
                <div className="border rounded-lg divide-y">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 hover:bg-accent/50"
                    >
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddMember(user.id)}
                        disabled={isPending}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Ajouter
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucun utilisateur trouvé
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des membres */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Membres ({members.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="p-3 mb-4 text-sm text-red-500 bg-red-50 dark:bg-red-950/50 rounded-lg">
              {error}
            </div>
          )}

          <div className="divide-y">
            {members.map((member) => {
              const isMe = member.userId === currentUserId
              const isMemberAdmin = member.role === 'admin'

              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center text-white font-bold',
                      isMemberAdmin ? 'bg-amber-500' : 'bg-primary'
                    )}>
                      {isMemberAdmin ? (
                        <Crown className="h-5 w-5" />
                      ) : (
                        <span>{member.userName.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{member.userName}</p>
                        {isMe && (
                          <Badge variant="outline" className="text-xs">Vous</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{member.userEmail}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={isMemberAdmin ? 'default' : 'secondary'}>
                      {isMemberAdmin ? 'Admin' : 'Membre'}
                    </Badge>

                    {isAdmin && !isMe && (
                      <div className="flex gap-1">
                        {/* Bouton promotion/rétrogradation */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRoleChange(
                            member.userId,
                            isMemberAdmin ? 'member' : 'admin'
                          )}
                          disabled={isPending}
                          title={isMemberAdmin ? 'Rétrograder' : 'Promouvoir admin'}
                        >
                          <Shield className={cn(
                            'h-4 w-4',
                            isMemberAdmin ? 'text-muted-foreground' : 'text-amber-500'
                          )} />
                        </Button>

                        {/* Bouton suppression */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={isPending}
                              className="text-destructive hover:text-destructive"
                            >
                              <UserMinus className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Retirer ce membre ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                {member.userName} sera retiré du groupe et ne pourra plus accéder aux messages.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleRemoveMember(member.userId)}
                                className="bg-destructive hover:bg-destructive/90"
                              >
                                Retirer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}

                    {/* Bouton pour quitter (non-admin pour soi-même) */}
                    {isMe && !isAdmin && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isPending}
                            className="text-destructive hover:text-destructive"
                          >
                            Quitter
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Quitter le groupe ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Vous ne pourrez plus accéder aux messages de ce groupe.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRemoveMember(currentUserId)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Quitter
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default MemberManager
