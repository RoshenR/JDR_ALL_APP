import { redirect } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getCurrentUser, getUsers } from '@/lib/actions/auth'
import { UserManagement } from '@/components/admin/UserManagement'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== 'MJ') {
    redirect('/')
  }

  const users = await getUsers()

  return (
    <>
      <Header
        title="Gestion des utilisateurs"
        description="Gérer les comptes et les rôles"
        user={user}
      />

      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Utilisateurs ({users.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <UserManagement users={users} currentUserId={user.id} />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
