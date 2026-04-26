'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Mail, Lock, User } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Registration failed')
      toast.success('Account created! Signing you in...')
      router.push('/dashboard')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card gradient-border animate-slide-up">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-zinc-50">Create your account</h1>
        <p className="text-sm text-zinc-500 mt-1">Start accepting fiat-to-crypto onramps</p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="label">Full name</label>
          <div className="relative">
            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="input pl-9"
              placeholder="Ada Lovelace"
              required
            />
          </div>
        </div>

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
          <label className="label">Password</label>
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

        <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-6">
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="text-sm text-zinc-500 text-center mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-brand-400 hover:text-brand-300 transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  )
}
