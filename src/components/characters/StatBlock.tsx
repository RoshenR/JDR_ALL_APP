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
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {entries.map(([key, value]) => (
            <div
              key={key}
              className="flex flex-col items-center rounded-lg border p-3 text-center"
            >
              <span className="text-2xl font-bold">{value}</span>
              <span className="text-xs text-muted-foreground">{key}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
