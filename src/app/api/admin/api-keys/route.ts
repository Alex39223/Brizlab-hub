import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/supabase'
import { prisma } from '@/lib/prisma'
import { generateApiKey } from '@/lib/utils'
import { z } from 'zod'

const createSchema = z.object({
  name: z.string().min(1).max(50),
  expiresAt: z.string().datetime().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({ where: { supabaseUserId: user.id } })
    if (!dbUser) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const body = await req.json()
    const { name, expiresAt } = createSchema.parse(body)

    const { key, hash, prefix } = generateApiKey()

    await prisma.apiKey.create({
      data: {
        userId: dbUser.id,
        name,
        keyHash: hash,
        keyPrefix: prefix,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    })

    // Return the raw key ONCE — we never store it
    return NextResponse.json({
      success: true,
      data: { key, prefix, name },
      message: 'Save this key — it will not be shown again.',
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const keyId = searchParams.get('id')
    if (!keyId) return NextResponse.json({ error: 'Missing key ID' }, { status: 400 })

    const dbUser = await prisma.user.findUnique({ where: { supabaseUserId: user.id } })
    if (!dbUser) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await prisma.apiKey.updateMany({
      where: { id: keyId, userId: dbUser.id },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
