'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { toast } from 'sonner'
import { Loader2, Lock } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )

  useEffect(() => {
    // Handle the hash fragment from Supabase reset email
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    const refreshToken = hashParams.get('refresh_token')
    const type = hashParams.get('type')

    if (type === 'recovery' && accessToken) {
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || '',
      }).then(() => {
        setReady(true)
      })
    } else {
      setReady(true)
    }
  }, [])

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      toast.error('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      toast.success('Password updated successfully!')
      setTimeout(() => router.push('/login'), 2000)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card gradient-border animate-slide-up">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-zinc-50">Set new password</h1>
        <p className="text-sm text-zinc-500 mt-1">Choose a strong password for your account</p>
      </div>
      <form onSubmit={handleReset} className="space-y-4">
        <div>
          <label className="label">New password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input pl-9"
              placeholder="Min. 8 characters"
              minLength={8}
              required
            />
          </div>
        </div>
        <div>
          <label className="label">Confirm password</label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className="input pl-9"
              placeholder="Repeat your password"
              minLength={8}
              required
            />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-6">
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? 'Updating...' : 'Update password'}
        </button>
      </form>
    </div>
  )
}
