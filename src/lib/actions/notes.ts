'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/db'
import { getCurrentUser } from './auth'

export type NoteCategory = 'quest' | 'npc' | 'location' | 'other'

export interface CharacterNote {
  id: string
  title: string
  content: string
  category: NoteCategory | null
  isPinned: boolean
  characterId: string
  createdAt: Date
  updatedAt: Date
}

async function canAccessCharacter(characterId: string): Promise<{ canRead: boolean; canWrite: boolean }> {
  const user = await getCurrentUser()
  if (!user) return { canRead: false, canWrite: false }

  const character = await prisma.character.findUnique({
    where: { id: characterId },
    select: { ownerId: true }
  })

  if (!character) return { canRead: false, canWrite: false }

  const isOwner = character.ownerId === user.id
  const isMJ = user.role === 'MJ'

  return {
    canRead: isOwner || isMJ,
    canWrite: isOwner
  }
}

async function canAccessNote(noteId: string): Promise<{ canRead: boolean; canWrite: boolean; characterId: string | null }> {
  const user = await getCurrentUser()
  if (!user) return { canRead: false, canWrite: false, characterId: null }

  const note = await prisma.characterNote.findUnique({
    where: { id: noteId },
    include: { character: { select: { ownerId: true } } }
  })

  if (!note) return { canRead: false, canWrite: false, characterId: null }

  const isOwner = note.character.ownerId === user.id
  const isMJ = user.role === 'MJ'

  return {
    canRead: isOwner || isMJ,
    canWrite: isOwner,
    characterId: note.characterId
  }
}

export async function getNotes(characterId: string): Promise<CharacterNote[]> {
  const access = await canAccessCharacter(characterId)
  if (!access.canRead) {
    throw new Error('Non autorisé')
  }

  const notes = await prisma.characterNote.findMany({
    where: { characterId },
    orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }]
  })

  return notes as CharacterNote[]
}

export async function getNote(id: string): Promise<CharacterNote | null> {
  const access = await canAccessNote(id)
  if (!access.canRead) {
    throw new Error('Non autorisé')
  }

  const note = await prisma.characterNote.findUnique({
    where: { id }
  })

  return note as CharacterNote | null
}

export async function createNote(
  characterId: string,
  data: {
    title: string
    content: string
    category?: NoteCategory
  }
): Promise<CharacterNote> {
  const access = await canAccessCharacter(characterId)
  if (!access.canWrite) {
    throw new Error('Non autorisé')
  }

  const note = await prisma.characterNote.create({
    data: {
      title: data.title,
      content: data.content,
      category: data.category || null,
      characterId
    }
  })

  revalidatePath(`/characters/${characterId}`)
  return note as CharacterNote
}

export async function updateNote(
  id: string,
  data: {
    title?: string
    content?: string
    category?: NoteCategory | null
  }
): Promise<CharacterNote> {
  const access = await canAccessNote(id)
  if (!access.canWrite) {
    throw new Error('Non autorisé')
  }

  const updateData: Record<string, unknown> = {}
  if (data.title !== undefined) updateData.title = data.title
  if (data.content !== undefined) updateData.content = data.content
  if (data.category !== undefined) updateData.category = data.category

  const note = await prisma.characterNote.update({
    where: { id },
    data: updateData
  })

  revalidatePath(`/characters/${access.characterId}`)
  return note as CharacterNote
}

export async function deleteNote(id: string): Promise<void> {
  const access = await canAccessNote(id)
  if (!access.canWrite) {
    throw new Error('Non autorisé')
  }

  await prisma.characterNote.delete({ where: { id } })
  revalidatePath(`/characters/${access.characterId}`)
}

export async function togglePinNote(id: string): Promise<CharacterNote> {
  const access = await canAccessNote(id)
  if (!access.canWrite) {
    throw new Error('Non autorisé')
  }

  const note = await prisma.characterNote.findUnique({ where: { id } })
  if (!note) throw new Error('Note non trouvée')

  const updated = await prisma.characterNote.update({
    where: { id },
    data: { isPinned: !note.isPinned }
  })

  revalidatePath(`/characters/${access.characterId}`)
  return updated as CharacterNote
}
