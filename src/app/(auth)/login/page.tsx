'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { toast } from 'sonner'
import { Loader2, Mail, Lock } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [forgotMode, setForgotMode] = useState(false)

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      router.push('/dashboard')
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://brizlab-hub.vercel.app/reset-password',
      })
      if (error) throw error
      toast.success('Password reset email sent! Check your inbox.')
      setForgotMode(false)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  if (forgotMode) {
    return (
      <div className="card gradient-border animate-slide-up">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-bold text-zinc-50">Reset password</h1>
          <p className="text-sm text-zinc-500 mt-1">Enter your email to receive a reset link</p>
        </div>
        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input pl-9"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-6">
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>
        <p className="text-sm text-zinc-500 text-center mt-6">
          <button onClick={() => setForgotMode(false)} className="text-brand-400 hover:text-brand-300 transition-colors">
            Back to sign in
          </button>
        </p>
      </div>
    )
  }

  return (
    <div className="card gradient-border animate-slide-up">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-zinc-50">Welcome back</h1>
        <p className="text-sm text-zinc-500 mt-1">Sign in to your OnRamp account</p>
      </div>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="label">Email</label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input pl-9"
              placeholder="you@example.com"
              required
            />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="label mb-0">Password</label>
            <button
              type="button"
              onClick={() => setForgotMode(true)}
              className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input pl-9"
              placeholder="••••••••"
              required
            />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-6">
          {loading ? <Loader2 size={16} className="animate-spin" /> : null}
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      <p className="text-sm text-zinc-500 text-center mt-6">
        No account?{' '}
        <Link href="/register" className="text-brand-400 hover:text-brand-300 transition-colors">
          Create one
        </Link>
      </p>
    </div>
  )
}
