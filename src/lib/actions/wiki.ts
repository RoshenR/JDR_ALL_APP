'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { slugify } from '@/lib/utils'
import { getCurrentUser } from './auth'

async function requireMJ() {
  const user = await getCurrentUser()
  if (!user) throw new Error('Non authentifié')
  if (user.role !== 'MJ') throw new Error('Réservé au MJ')
  return user
}

export async function getArticles(category?: string) {
  const where = category ? { category } : {}
  const articles = await prisma.wikiArticle.findMany({
    where,
    orderBy: { updatedAt: 'desc' }
  })
  return articles.map(a => ({
    ...a,
    tags: JSON.parse(a.tags)
  }))
}

export async function getArticle(slug: string) {
  const article = await prisma.wikiArticle.findUnique({
    where: { slug }
  })
  if (!article) return null
  return {
    ...article,
    tags: JSON.parse(article.tags)
  }
}

export async function getArticleById(id: string) {
  const article = await prisma.wikiArticle.findUnique({
    where: { id }
  })
  if (!article) return null
  return {
    ...article,
    tags: JSON.parse(article.tags)
  }
}

export async function createArticle(data: {
  title: string
  content: string
  category: string
  imageUrl?: string
  tags?: string[]
}) {
  await requireMJ()

  let slug = slugify(data.title)

  // Ensure unique slug
  const existing = await prisma.wikiArticle.findUnique({ where: { slug } })
  if (existing) {
    slug = `${slug}-${Date.now()}`
  }

  const article = await prisma.wikiArticle.create({
    data: {
      title: data.title,
      slug,
      content: data.content,
      category: data.category,
      imageUrl: data.imageUrl || null,
      tags: JSON.stringify(data.tags || [])
    }
  })
  revalidatePath('/wiki')
  revalidatePath(`/wiki/${data.category}`)
  return article
}

export async function updateArticle(id: string, data: {
  title?: string
  content?: string
  category?: string
  imageUrl?: string
  tags?: string[]
}) {
  await requireMJ()

  const updateData: Record<string, unknown> = {}
  if (data.title !== undefined) {
    updateData.title = data.title
    updateData.slug = slugify(data.title)
  }
  if (data.content !== undefined) updateData.content = data.content
  if (data.category !== undefined) updateData.category = data.category
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl
  if (data.tags !== undefined) updateData.tags = JSON.stringify(data.tags)

  const article = await prisma.wikiArticle.update({
    where: { id },
    data: updateData
  })
  revalidatePath('/wiki')
  revalidatePath(`/wiki/${article.category}`)
  revalidatePath(`/wiki/articles/${article.slug}`)
  return article
}

export async function deleteArticle(id: string) {
  await requireMJ()
  const article = await prisma.wikiArticle.delete({ where: { id } })
  revalidatePath('/wiki')
  revalidatePath(`/wiki/${article.category}`)
}

export async function searchArticles(query: string) {
  const articles = await prisma.wikiArticle.findMany({
    where: {
      OR: [
        { title: { contains: query } },
        { content: { contains: query } }
      ]
    },
    orderBy: { updatedAt: 'desc' }
  })
  return articles.map(a => ({
    ...a,
    tags: JSON.parse(a.tags)
  }))
}
