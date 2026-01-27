import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { ArticleCard } from '@/components/wiki/ArticleCard'
import { CategoryNav } from '@/components/wiki/CategoryNav'
import { Plus } from 'lucide-react'
import { getArticles } from '@/lib/actions/wiki'
import { getCurrentUser } from '@/lib/actions/auth'

export const dynamic = 'force-dynamic'

export default async function WikiPage() {
  const user = await getCurrentUser()
  const articles = await getArticles()

  return (
    <>
      <Header
        title="Wiki"
        description={`${articles.length} article${articles.length > 1 ? 's' : ''}`}
        user={user}
        action={
          user?.role === 'MJ' ? (
            <Button asChild>
              <Link href="/wiki/new">
                <Plus className="mr-1 h-4 w-4" /> Nouvel article
              </Link>
            </Button>
          ) : undefined
        }
      />

      <div className="p-6 space-y-6">
        <CategoryNav />

        {articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-4">
              Aucun article pour le moment
            </p>
            {user?.role === 'MJ' && (
              <Button asChild>
                <Link href="/wiki/new">
                  <Plus className="mr-1 h-4 w-4" /> Créer un article
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
