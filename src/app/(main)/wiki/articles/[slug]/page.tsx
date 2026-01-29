import { notFound } from 'next/navigation'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { Header } from '@/components/layout/Header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getArticle, deleteArticle } from '@/lib/actions/wiki'
import { WIKI_CATEGORIES, type WikiCategory } from '@/types'
import { Edit, Trash2, FileText, ArrowLeft } from 'lucide-react'
import { redirect } from 'next/navigation'

interface PageProps {
  params: { slug: string }
}

export default async function ArticlePage({ params }: PageProps) {
  const article = await getArticle(params.slug)

  if (!article) {
    notFound()
  }

  const categoryInfo = WIKI_CATEGORIES[article.category as WikiCategory]

  async function handleDelete() {
    'use server'
    await deleteArticle(article!.id)
    redirect('/wiki')
  }

  return (
    <>
      <Header
        title={article.title}
        description={categoryInfo?.label || article.category}
        action={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={`/wiki/articles/${article.slug}/edit`}>
                <Edit className="mr-1 h-4 w-4" /> Modifier
              </Link>
            </Button>
            <form action={handleDelete}>
              <Button type="submit" variant="destructive">
                <Trash2 className="mr-1 h-4 w-4" /> Supprimer
              </Button>
            </form>
          </div>
        }
      />

      <div className="p-6 max-w-4xl">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href={`/wiki/${article.category}`}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Retour à {categoryInfo?.label}
          </Link>
        </Button>

        <Card>
          <CardContent className="pt-6">
            {article.imageUrl && (
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full max-h-64 object-cover rounded-lg mb-6"
              />
            )}

            {article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {article.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{article.content}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
