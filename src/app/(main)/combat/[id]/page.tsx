import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { CombatTracker } from '@/components/combat/CombatTracker'
import { getCombat, deleteCombat } from '@/lib/actions/combat'
import { getCharacters } from '@/lib/actions/characters'
import { getCurrentUser } from '@/lib/actions/auth'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { redirect } from 'next/navigation'

interface PageProps {
  params: { id: string }
}

export const dynamic = 'force-dynamic'

export default async function CombatDetailPage({ params }: PageProps) {
  const [combat, characters, user] = await Promise.all([
    getCombat(params.id),
    getCharacters(),
    getCurrentUser()
  ])

  if (!combat) {
    notFound()
  }

  async function handleDelete() {
    'use server'
    await deleteCombat(params.id)
    redirect('/combat')
  }

  return (
    <>
      <Header
        title={combat.name}
        description={combat.isActive ? 'Combat en cours' : 'Combat terminé'}
        user={user}
        action={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/combat">
                <ArrowLeft className="mr-1 h-4 w-4" /> Retour
              </Link>
            </Button>
            {user?.role === 'MJ' && (
              <form action={handleDelete}>
                <Button type="submit" variant="destructive">
                  <Trash2 className="mr-1 h-4 w-4" /> Supprimer
                </Button>
              </form>
            )}
          </div>
        }
      />

      <div className="p-6">
        <CombatTracker
          combat={combat}
          characters={characters.map(c => ({ id: c.id, name: c.name }))}
          isMJ={user?.role === 'MJ'}
        />
      </div>
    </>
  )
}
