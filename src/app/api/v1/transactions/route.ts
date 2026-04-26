import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiKey } from '@/lib/apiAuth'
import { prisma } from '@/lib/prisma'

// GET /api/v1/transactions
export async function GET(req: NextRequest) {
  const auth = await authenticateApiKey(req)
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') ?? '50')
    const offset = parseInt(searchParams.get('offset') ?? '0')

    const where: {
      userId?: string
      status?: string
    } = {}
    if (userId) where.userId = userId
    if (status) where.status = status.toUpperCase()

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: Math.min(limit, 100),
        skip: offset,
        include: {
          user: { select: { email: true, name: true } },
        },
      }),
      prisma.transaction.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: transactions,
      meta: { total, limit, offset },
    })
  } catch {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
