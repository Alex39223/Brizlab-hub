import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiKey } from '@/lib/apiAuth'
import { prisma } from '@/lib/prisma'
import { createVirtualAccount } from '@/lib/bridge'
import { z } from 'zod'

const schema = z.object({
  userId: z.string(),
  currency: z.enum(['usd', 'eur']),
  destinationAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  destinationCurrency: z.enum(['usdc', 'usdt', 'eth']).default('usdc'),
  destinationRail: z.enum(['ethereum', 'polygon', 'base']).default('ethereum'),
})

// POST /api/v1/virtual-accounts
export async function POST(req: NextRequest) {
  const auth = await authenticateApiKey(req)
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const body = await req.json()
    const data = schema.parse(body)

    const user = await prisma.user.findUnique({ where: { id: data.userId } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    if (user.kycStatus !== 'APPROVED') {
      return NextResponse.json({ error: 'User KYC not approved' }, { status: 403 })
    }
    if (!user.bridgeCustomerId) {
      return NextResponse.json({ error: 'Bridge customer not set up' }, { status: 400 })
    }

    const bridgeAccount = await createVirtualAccount(user.bridgeCustomerId, {
      currency: data.currency,
      destinationAddress: data.destinationAddress,
      destinationCurrency: data.destinationCurrency,
      destinationRail: data.destinationRail,
    })

    const instructions = bridgeAccount.source_deposit_instructions
    const isUSD = data.currency === 'usd'

    const account = await prisma.virtualAccount.create({
      data: {
        userId: user.id,
        bridgeAccountId: bridgeAccount.id,
        currency: data.currency,
        status: bridgeAccount.status,
        bankName: (instructions as { bank_name?: string }).bank_name ?? null,
        accountNumber: isUSD ? (instructions as { bank_account_number?: string }).bank_account_number ?? null : null,
        routingNumber: isUSD ? (instructions as { bank_routing_number?: string }).bank_routing_number ?? null : null,
        iban: !isUSD ? (instructions as { iban?: string }).iban ?? null : null,
        bic: !isUSD ? (instructions as { bic?: string }).bic ?? null : null,
        accountHolderName: (instructions as { bank_beneficiary_name?: string; account_holder_name?: string }).bank_beneficiary_name
          ?? (instructions as { account_holder_name?: string }).account_holder_name ?? null,
        paymentRails: (instructions as { payment_rails?: string[] }).payment_rails ?? [],
        destinationCurrency: data.destinationCurrency,
        destinationRail: data.destinationRail,
        destinationAddress: data.destinationAddress,
        developerFeePercent: process.env.DEVELOPER_FEE_PERCENT ?? '1.0',
      },
    })

    return NextResponse.json({ success: true, data: account })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// GET /api/v1/virtual-accounts
export async function GET(req: NextRequest) {
  const auth = await authenticateApiKey(req)
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    const where = userId ? { userId } : {}
    const accounts = await prisma.virtualAccount.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: accounts })
  } catch {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
