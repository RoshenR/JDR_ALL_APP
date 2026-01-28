'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'

const SESSION_COOKIE = 'jdr_session'
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

export type UserRole = 'MJ' | 'PLAYER'

export interface SessionUser {
  id: string
  email: string
  name: string
  role: UserRole
  chatColor: string | null
}

export async function register(data: {
  email: string
  password: string
  name: string
  role?: UserRole
}) {
  const existing = await prisma.user.findUnique({
    where: { email: data.email }
  })

  if (existing) {
    return { error: 'Un compte avec cet email existe déjà' }
  }

  const hashedPassword = await bcrypt.hash(data.password, 10)

  // First user is always MJ
  const userCount = await prisma.user.count()
  const role = userCount === 0 ? 'MJ' : (data.role || 'PLAYER')

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      role
    }
  })

  // Create session
  await createSession(user.id)

  return { success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } }
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user) {
    return { error: 'Email ou mot de passe incorrect' }
  }

  const validPassword = await bcrypt.compare(password, user.password)
  if (!validPassword) {
    return { error: 'Email ou mot de passe incorrect' }
  }

  await createSession(user.id)

  return { success: true, user: { id: user.id, email: user.email, name: user.name, role: user.role } }
}

export async function logout() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value

  if (sessionId) {
    await prisma.authSession.delete({ where: { id: sessionId } }).catch(() => {})
    cookieStore.delete(SESSION_COOKIE)
  }

  redirect('/login')
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value

  if (!sessionId) return null

  const session = await prisma.authSession.findUnique({
    where: { id: sessionId }
  })

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.authSession.delete({ where: { id: sessionId } }).catch(() => {})
    }
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true, name: true, role: true, chatColor: true }
  })

  return user as SessionUser | null
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }
  return user
}

export async function requireMJ(): Promise<SessionUser> {
  const user = await requireAuth()
  if (user.role !== 'MJ') {
    redirect('/?error=unauthorized')
  }
  return user
}

async function createSession(userId: string) {
  // Clean up old sessions for this user
  await prisma.authSession.deleteMany({
    where: { userId }
  })

  const session = await prisma.authSession.create({
    data: {
      userId,
      expiresAt: new Date(Date.now() + SESSION_DURATION)
    }
  })

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: session.expiresAt
  })
}

export async function getUsers() {
  return prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, createdAt: true },
    orderBy: { createdAt: 'asc' }
  })
}

export async function updateUserRole(userId: string, role: UserRole) {
  await prisma.user.update({
    where: { id: userId },
    data: { role }
  })
}

export async function deleteUser(userId: string) {
  await prisma.user.delete({ where: { id: userId } })
}
