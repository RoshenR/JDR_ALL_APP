import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { CombatCard } from '@/components/combat/CombatCard'
import { Plus } from 'lucide-react'
import { getCombats } from '@/lib/actions/combat'
import { getCurrentUser } from '@/lib/actions/auth'

export const dynamic = 'force-dynamic'

export default async function CombatPage() {
  const user = await getCurrentUser()
  const combats = await getCombats()
  const activeCombats = combats.filter(c => c.isActive)
  const finishedCombats = combats.filter(c => !c.isActive)

  return (
    <>
      <Header
        title="Tracker de Combat"
        description={`${activeCombats.length} combat${activeCombats.length > 1 ? 's' : ''} en cours`}
        user={user}
        action={
          user?.role === 'MJ' ? (
            <Button asChild>
              <Link href="/combat/new">
                <Plus className="mr-1 h-4 w-4" /> Nouveau combat
              </Link>
            </Button>
          ) : undefined
        }
      />

      <div className="p-6 space-y-8">
        {/* Active Combats */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Combats en cours</h2>
          {activeCombats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-muted/50">
              <p className="text-muted-foreground mb-4">
                Aucun combat en cours
              </p>
              {user?.role === 'MJ' && (
                <Button asChild>
                  <Link href="/combat/new">
                    <Plus className="mr-1 h-4 w-4" /> Lancer un combat
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {activeCombats.map((combat) => (
                <CombatCard key={combat.id} combat={combat} />
              ))}
            </div>
          )}
        </section>

        {/* Finished Combats */}
        {finishedCombats.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-4">Combats terminés</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {finishedCombats.map((combat) => (
                <CombatCard key={combat.id} combat={combat} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}
