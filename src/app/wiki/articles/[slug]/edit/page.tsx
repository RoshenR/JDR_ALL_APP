import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { ArticleEditor } from '@/components/wiki/ArticleEditor'
import { getArticle } from '@/lib/actions/wiki'

interface PageProps {
  params: { slug: string }
}

export default async function EditArticlePage({ params }: PageProps) {
  const article = await getArticle(params.slug)

  if (!article) {
    notFound()
  }

  return (
    <>
      <Header
        title={`Modifier ${article.title}`}
        description="Modifier l'article wiki"
      />

      <div className="p-6 max-w-4xl">
        <ArticleEditor article={article} />
      </div>
    </>
  )
}
