import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { SessionNotes } from '@/components/campaigns/SessionNotes'
import { AvailabilityPicker } from '@/components/campaigns/AvailabilityPicker'
import { AvailabilitySummary } from '@/components/campaigns/AvailabilitySummary'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getSession } from '@/lib/actions/campaigns'
import { getMyAvailability, getCampaignPlayersWithAvailability } from '@/lib/actions/availability'
import { getCurrentUser } from '@/lib/actions/auth'
import { ArrowLeft, Calendar } from 'lucide-react'

interface PageProps {
  params: { id: string; sessionId: string }
}

export default async function SessionPage({ params }: PageProps) {
  const [session, user, myAvailability, players] = await Promise.all([
    getSession(params.sessionId),
    getCurrentUser(),
    getMyAvailability(params.sessionId),
    getCampaignPlayersWithAvailability(params.id, params.sessionId)
  ])

  if (!session || session.campaignId !== params.id) {
    notFound()
  }

  const isMJ = user?.role === 'MJ'

  return (
    <>
      <Header
        title={`Session ${session.number}: ${session.title}`}
        description={session.campaign?.name}
        user={user}
        action={
          <Button asChild variant="outline">
            <Link href={`/campaigns/${params.id}`}>
              <ArrowLeft className="mr-1 h-4 w-4" /> Retour a la campagne
            </Link>
          </Button>
        }
      />

      <div className="p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <SessionNotes session={session} />
          </div>

          {/* Sidebar - Availability */}
          <div className="space-y-6">
            {/* My availability (only for players) */}
            {!isMJ && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Ma disponibilite
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AvailabilityPicker
                    sessionId={params.sessionId}
                    currentStatus={myAvailability?.status as 'AVAILABLE' | 'UNAVAILABLE' | 'MAYBE' | 'NO_RESPONSE' | null}
                  />
                </CardContent>
              </Card>
            )}

            {/* All players availability */}
            {players.length > 0 && (
              <AvailabilitySummary players={players} />
            )}
          </div>
        </div>
      </div>
    </>
  )
}
