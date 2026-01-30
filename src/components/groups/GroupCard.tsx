'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Crown, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { GroupRecord } from '@/lib/group-types'

interface GroupCardProps {
  group: GroupRecord
}

const GROUP_COLORS: Record<string, string> = {
  blue: 'bg-blue-500',
  emerald: 'bg-emerald-500',
  violet: 'bg-violet-500',
  rose: 'bg-rose-500',
  cyan: 'bg-cyan-500',
  orange: 'bg-orange-500',
  pink: 'bg-pink-500',
  teal: 'bg-teal-500',
  amber: 'bg-amber-500',
}

function getGroupColor(color: string | null): string {
  if (color && GROUP_COLORS[color]) {
    return GROUP_COLORS[color]
  }
  return 'bg-primary'
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function GroupCard({ group }: GroupCardProps) {
  return (
    <Link href={`/groups/${group.id}`}>
      <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Icône du groupe */}
            <div className={cn(
              'w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold shrink-0',
              getGroupColor(group.color)
            )}>
              {group.iconUrl ? (
                <img
                  src={group.iconUrl}
                  alt={group.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <span className="text-lg">{getInitials(group.name)}</span>
              )}
            </div>

            {/* Infos du groupe */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold truncate">{group.name}</h3>
                {group.isAdmin && (
                  <Badge variant="secondary" className="shrink-0">
                    <Crown className="h-3 w-3 mr-1" />
                    Admin
                  </Badge>
                )}
              </div>

              {group.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {group.description}
                </p>
              )}

              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {group.memberCount} membre{group.memberCount !== 1 ? 's' : ''}
                </span>
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  Chat
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default GroupCard
