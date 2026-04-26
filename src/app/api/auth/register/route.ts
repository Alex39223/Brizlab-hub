import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, password } = schema.parse(body)

    const supabase = createSupabaseAdmin()

    // Create Supabase auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm for now — set up email flow later
    })

    if (authError) throw new Error(authError.message)

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

    // Sign in the user
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (signInError) throw new Error(signInError.message)

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Registration failed'
    return NextResponse.json({ success: false, error: msg }, { status: 400 })
  }
}
