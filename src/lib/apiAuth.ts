import { prisma } from '@/lib/prisma'
import { hashApiKey } from '@/lib/utils'
import { NextRequest } from 'next/server'

export async function authenticateApiKey(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return { error: 'Missing authorization header', status: 401, user: null }
  }

  const key = authHeader.replace('Bearer ', '').trim()
  if (!key.startsWith('brk_')) {
    return { error: 'Invalid API key format', status: 401, user: null }
  }

  const keyHash = hashApiKey(key)

  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash },
    include: { user: true },
  })

  if (!apiKey || !apiKey.isActive) {
    return { error: 'Invalid or inactive API key', status: 401, user: null }
  }

  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return { error: 'API key expired', status: 401, user: null }
  }

  // Update last used
  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  })

  return { error: null, status: 200, user: apiKey.user }
}
