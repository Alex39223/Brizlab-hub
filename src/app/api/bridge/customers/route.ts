import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/supabase'
import { prisma } from '@/lib/prisma'
import { createBridgeCustomer, createKYCLink } from '@/lib/bridge'
import { z } from 'zod'

const schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
})

export async function POST(req: NextRequest) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({ where: { supabaseUserId: user.id } })
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const body = await req.json()
    const { firstName, lastName } = schema.parse(body)

    // If already has Bridge customer, just return a new KYC link
    let bridgeCustomerId = dbUser.bridgeCustomerId

    if (!bridgeCustomerId) {
      // Create Bridge customer
      const bridgeCustomer = await createBridgeCustomer({
        first_name: firstName,
        last_name: lastName,
        email: dbUser.email,
        type: 'individual',
      })
      bridgeCustomerId = bridgeCustomer.id

      // Update DB
      await prisma.user.update({
        where: { id: dbUser.id },
        data: {
          bridgeCustomerId,
          kycStatus: 'PENDING',
          name: `${firstName} ${lastName}`,
        },
      })
    }

    // Create KYC link
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?kyc=complete`
    const kycLink = await createKYCLink(bridgeCustomerId, redirectUrl)

    return NextResponse.json({
      success: true,
      data: {
        customerId: bridgeCustomerId,
        kycUrl: kycLink.url,
        kycStatus: kycLink.kyc_status,
      },
    })
  } catch (err: unknown) {
    console.error('Bridge customer error:', err)
    const msg = err instanceof Error ? err.message : 'Failed to create customer'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}

export async function GET() {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const dbUser = await prisma.user.findUnique({ where: { supabaseUserId: user.id } })
    if (!dbUser) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({
      success: true,
      data: {
        bridgeCustomerId: dbUser.bridgeCustomerId,
        kycStatus: dbUser.kycStatus,
      },
    })
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
