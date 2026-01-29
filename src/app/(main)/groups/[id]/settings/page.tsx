'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { GroupForm } from '@/components/groups/GroupForm'
import { MemberManager } from '@/components/groups/MemberManager'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
  getGroup,
  getGroupMembers,
  deleteGroup,
  type GroupRecord,
  type GroupMemberRecord
} from '@/lib/actions/groups'
import { getCurrentUser, type SessionUser } from '@/lib/actions/auth'
import { Loader2, Trash2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
  params: { id: string }
}

export default function GroupSettingsPage({ params }: PageProps) {
  const router = useRouter()
  const [user, setUser] = useState<SessionUser | null>(null)
  const [group, setGroup] = useState<GroupRecord | null>(null)
  const [members, setMembers] = useState<GroupMemberRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    async function loadData() {
      const [currentUser, groupData, membersData] = await Promise.all([
        getCurrentUser(),
        getGroup(params.id),
        getGroupMembers(params.id)
      ])

      if (!currentUser) {
        router.push('/login')
        return
      }

      if (!groupData) {
        router.push('/groups')
        return
      }

      if (!groupData.isAdmin) {
        router.push(`/groups/${params.id}`)
        return
      }

      setUser(currentUser)
      setGroup(groupData)
      setMembers(membersData)
      setIsLoading(false)
    }

    loadData()
  }, [params.id, router])

  const handleDeleteGroup = () => {
    startTransition(async () => {
      const result = await deleteGroup(params.id)
      if (result.success) {
        router.push('/groups')
      }
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user || !group) {
    return null
  }

  return (
    <>
      <Header
        title="Paramètres du groupe"
        description={group.name}
        user={user}
        action={
          <Link href={`/groups/${params.id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au chat
            </Button>
          </Link>
        }
      />

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Formulaire d'édition */}
        <GroupForm group={group} mode="edit" />

        {/* Gestion des membres */}
        <MemberManager
          groupId={group.id}
          members={members}
          currentUserId={user.id}
          isAdmin={group.isAdmin || false}
        />

        {/* Zone de danger */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Zone de danger</CardTitle>
            <CardDescription>
              Actions irréversibles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isPending}>
                  {isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Supprimer le groupe
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer le groupe ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible. Tous les messages seront supprimés
                    et les membres perdront l&apos;accès au groupe.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteGroup}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Supprimer définitivement
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
