import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/supabase'
import { prisma } from '@/lib/prisma'
import { createVirtualAccount } from '@/lib/bridge'
import { z } from 'zod'

const schema = z.object({
  currency: z.enum(['usd', 'eur']),
  destinationAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  destinationCurrency: z.enum(['usdc', 'usdt', 'eth']).default('usdc'),
  destinationRail: z.enum(['ethereum', 'polygon', 'base', 'solana']).default('ethereum'),
})

export async function POST(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({ where: { supabaseUserId: user.id } })
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    if (dbUser.kycStatus !== 'APPROVED') {
      return NextResponse.json({ error: 'KYC must be approved first' }, { status: 403 })
    }
    if (!dbUser.bridgeCustomerId) {
      return NextResponse.json({ error: 'Bridge customer not created' }, { status: 400 })
    }

    const body = await req.json()
    const data = schema.parse(body)

    // Create virtual account on Bridge
    const bridgeAccount = await createVirtualAccount(dbUser.bridgeCustomerId, {
      currency: data.currency,
      destinationAddress: data.destinationAddress,
      destinationCurrency: data.destinationCurrency,
      destinationRail: data.destinationRail,
    })

    const instructions = bridgeAccount.source_deposit_instructions

    // Store in DB
    const isUSD = data.currency === 'usd'
    const usdInstructions = isUSD ? (instructions as {
      bank_name: string
      bank_address: string
      bank_account_number: string
      bank_routing_number: string
      bank_beneficiary_name: string
      payment_rail: string
      payment_rails: string[]
    }) : null
    const eurInstructions = !isUSD ? (instructions as {
      iban: string
      bic: string
      account_holder_name: string
      bank_name: string
      bank_address: string
      payment_rail: string
      payment_rails: string[]
    }) : null

    const virtualAccount = await prisma.virtualAccount.create({
      data: {
        userId: dbUser.id,
        bridgeAccountId: bridgeAccount.id,
        currency: data.currency,
        status: bridgeAccount.status,
        bankName: usdInstructions?.bank_name ?? eurInstructions?.bank_name ?? null,
        bankAddress: usdInstructions?.bank_address ?? eurInstructions?.bank_address ?? null,
        accountNumber: usdInstructions?.bank_account_number ?? null,
        routingNumber: usdInstructions?.bank_routing_number ?? null,
        iban: eurInstructions?.iban ?? null,
        bic: eurInstructions?.bic ?? null,
        accountHolderName: usdInstructions?.bank_beneficiary_name ?? eurInstructions?.account_holder_name ?? null,
        paymentRails: (usdInstructions?.payment_rails ?? eurInstructions?.payment_rails ?? []),
        destinationCurrency: data.destinationCurrency,
        destinationRail: data.destinationRail,
        destinationAddress: data.destinationAddress,
        developerFeePercent: process.env.DEVELOPER_FEE_PERCENT ?? '1.0',
      },
    })

    return NextResponse.json({ success: true, data: virtualAccount })
  } catch (err: unknown) {
    console.error('Virtual account error:', err)
    const msg = err instanceof Error ? err.message : 'Failed to create virtual account'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

export async function GET() {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({ where: { supabaseUserId: user.id } })
    if (!dbUser) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const accounts = await prisma.virtualAccount.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: accounts })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
