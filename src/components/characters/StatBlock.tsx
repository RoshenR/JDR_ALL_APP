import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface StatBlockProps {
  title: string
  stats: Record<string, string | number>
}

export function StatBlock({ title, stats }: StatBlockProps) {
  const entries = Object.entries(stats)

  if (entries.length === 0) return null

  return (
    <Card>
      <CardHeader className="pb-2 sm:pb-3">
        <CardTitle className="text-sm sm:text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-3 gap-2 sm:gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {entries.map(([key, value]) => (
            <div
              key={key}
              className="flex flex-col items-center rounded-lg border bg-muted/30 p-2 sm:p-3 text-center transition-colors hover:bg-muted/50"
            >
              <span className="text-xl sm:text-2xl font-bold">{value}</span>
              <span className="text-[10px] sm:text-xs text-muted-foreground truncate w-full">{key}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
