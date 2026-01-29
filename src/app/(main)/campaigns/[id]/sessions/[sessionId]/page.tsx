import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { SessionNotes } from '@/components/campaigns/SessionNotes'
import { getSession } from '@/lib/actions/campaigns'
import { ArrowLeft } from 'lucide-react'

interface PageProps {
  params: { id: string; sessionId: string }
}

export default async function SessionPage({ params }: PageProps) {
  const session = await getSession(params.sessionId)

  if (!session || session.campaignId !== params.id) {
    notFound()
  }

  return (
    <>
      <Header
        title={`Session ${session.number}: ${session.title}`}
        description={session.campaign?.name}
        action={
          <Button asChild variant="outline">
            <Link href={`/campaigns/${params.id}`}>
              <ArrowLeft className="mr-1 h-4 w-4" /> Retour à la campagne
            </Link>
          </Button>
        }
      />

      <div className="p-6 max-w-4xl">
        <SessionNotes session={session} />
      </div>
    </>
  )
}
