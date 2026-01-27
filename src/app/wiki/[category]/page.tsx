import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { ArticleCard } from '@/components/wiki/ArticleCard'
import { CategoryNav } from '@/components/wiki/CategoryNav'
import { Plus } from 'lucide-react'
import { getArticles } from '@/lib/actions/wiki'
import { WIKI_CATEGORIES, type WikiCategory } from '@/types'

interface PageProps {
  params: { category: string }
}

export default async function WikiCategoryPage({ params }: PageProps) {
  const category = params.category as WikiCategory

  if (!WIKI_CATEGORIES[category]) {
    notFound()
  }

  const articles = await getArticles(category)
  const { label, description } = WIKI_CATEGORIES[category]

  return (
    <>
      <Header
        title={label}
        description={description}
        action={
          <Button asChild>
            <Link href={`/wiki/new?category=${category}`}>
              <Plus className="mr-1 h-4 w-4" /> Nouvel article
            </Link>
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        <CategoryNav />

        {articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground mb-4">
              Aucun article dans cette catégorie
            </p>
            <Button asChild>
              <Link href={`/wiki/new?category=${category}`}>
                <Plus className="mr-1 h-4 w-4" /> Créer un article
              </Link>
            </Button>
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
