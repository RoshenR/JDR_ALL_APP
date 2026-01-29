import { Header } from '@/components/layout/Header'
import { ArticleEditor } from '@/components/wiki/ArticleEditor'

export default function NewArticlePage() {
  return (
    <>
      <Header
        title="Nouvel article"
        description="Créer un nouvel article wiki"
      />

      <div className="p-6 max-w-4xl">
        <ArticleEditor />
      </div>
    </>
  )
}
