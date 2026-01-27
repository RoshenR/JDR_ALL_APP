import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sword, Users, Calendar } from 'lucide-react'

interface CampaignCardProps {
  campaign: {
    id: string
    name: string
    description: string | null
    imageUrl: string | null
    system: string | null
    characters?: Array<{ id: string }>
    sessions?: Array<{ id: string; title: string }>
  }
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const lastSession = campaign.sessions?.[0]

  return (
    <Link href={`/campaigns/${campaign.id}`}>
      <Card className="h-full transition-all hover:shadow-md hover:border-primary/50">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-4">
            {campaign.imageUrl ? (
              <img
                src={campaign.imageUrl}
                alt={campaign.name}
                className="h-16 w-16 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
                <Sword className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">{campaign.name}</CardTitle>
              {campaign.system && (
                <p className="text-sm text-muted-foreground">{campaign.system}</p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {campaign.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {campaign.description}
            </p>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {campaign.characters?.length || 0} PJ
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {campaign.sessions?.length || 0} sessions
            </span>
          </div>
          {lastSession && (
            <p className="mt-2 text-xs text-muted-foreground">
              Dernière session: {lastSession.title}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
