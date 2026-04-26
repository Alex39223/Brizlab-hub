import { NextRequest, NextResponse } from 'next/server'
import { authenticateApiKey } from '@/lib/apiAuth'
import { prisma } from '@/lib/prisma'
import { createBridgeCustomer, createKYCLink } from '@/lib/bridge'
import { z } from 'zod'

const schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
})

// POST /api/v1/customers
export async function POST(req: NextRequest) {
  const auth = await authenticateApiKey(req)
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const body = await req.json()
    const { firstName, lastName, email } = schema.parse(body)

    // Find or create user in DB
    let user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      user = await prisma.user.create({
        data: { email, name: `${firstName} ${lastName}`, kycStatus: 'NOT_STARTED' },
      })
    }

    let bridgeCustomerId = user.bridgeCustomerId
    if (!bridgeCustomerId) {
      const bc = await createBridgeCustomer({ first_name: firstName, last_name: lastName, email })
      bridgeCustomerId = bc.id
      await prisma.user.update({
        where: { id: user.id },
        data: { bridgeCustomerId, kycStatus: 'PENDING' },
      })
    }

    const kycLink = await createKYCLink(bridgeCustomerId)

    return NextResponse.json({
      success: true,
      data: { customerId: bridgeCustomerId, kycUrl: kycLink.url, userId: user.id },
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// GET /api/v1/customers/:id — handled via dynamic route
