import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
})

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, password } = schema.parse(body)

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Sign up with Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) throw new Error(authError.message)
    if (!authData.user) throw new Error('Failed to create user')

    // Create DB user record
    await prisma.user.create({
      data: {
        email,
        name,
        supabaseUserId: authData.user.id,
        role: 'USER',
        kycStatus: 'NOT_STARTED',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Registration failed'
    return NextResponse.json({ success: false, error: msg }, { status: 400 })
  }
}
