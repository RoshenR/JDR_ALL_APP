import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { GroupCard } from '@/components/groups/GroupCard'
import { getUserGroups } from '@/lib/actions/groups'
import { getCurrentUser } from '@/lib/actions/auth'
import { Plus, Users } from 'lucide-react'

export default async function GroupsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  const groups = await getUserGroups()

  return (
    <>
      <Header
        title="Groupes"
        description="Vos groupes de discussion"
        user={user}
        action={
          <Link href="/groups/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau groupe
            </Button>
          </Link>
        }
      />

      <div className="p-6">
        {groups.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Aucun groupe</h2>
            <p className="text-muted-foreground mb-4">
              Créez un groupe pour discuter avec d'autres joueurs
            </p>
            <Link href="/groups/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Créer un groupe
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {groups.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
