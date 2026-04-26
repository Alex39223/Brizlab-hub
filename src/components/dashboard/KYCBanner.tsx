'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { AlertCircle, ExternalLink, Loader2, CheckCircle2 } from 'lucide-react'
import { KYCStatus } from '@/types'

export default function KYCBanner({ status }: { status: KYCStatus }) {
  const [loading, setLoading] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [showForm, setShowForm] = useState(false)

  async function startKYC(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/bridge/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      // Open KYC link in new tab
      window.open(data.data.kycUrl, '_blank')
      toast.success('KYC link opened — complete verification to proceed')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to start KYC')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'APPROVED') return null

  const configs = {
    NOT_STARTED: {
      icon: AlertCircle,
      color: 'border-yellow-800 bg-yellow-950/30',
      iconColor: 'text-yellow-400',
      title: 'Identity verification required',
      desc: 'You need to complete KYC before creating virtual accounts.',
      cta: 'Start KYC',
    },
    PENDING: {
      icon: Loader2,
      color: 'border-blue-800 bg-blue-950/30',
      iconColor: 'text-blue-400',
      title: 'KYC under review',
      desc: 'Your identity is being verified by Bridge. This usually takes a few minutes.',
      cta: null,
    },
    REJECTED: {
      icon: AlertCircle,
      color: 'border-red-800 bg-red-950/30',
      iconColor: 'text-red-400',
      title: 'KYC rejected',
      desc: 'Your KYC was rejected. Please contact support or try again.',
      cta: 'Retry KYC',
    },
    APPROVED: {
      icon: CheckCircle2,
      color: '',
      iconColor: '',
      title: '',
      desc: '',
      cta: null,
    }
  }

  const config = configs[status]
  const Icon = config.icon

  return (
    <div className={`rounded-xl border p-4 ${config.color}`}>
      <div className="flex items-start gap-3">
        <Icon size={20} className={`${config.iconColor} shrink-0 mt-0.5 ${status === 'PENDING' ? 'animate-spin' : ''}`} />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-zinc-200">{config.title}</p>
          <p className="text-sm text-zinc-500 mt-0.5">{config.desc}</p>

          {config.cta && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary mt-3 text-sm"
            >
              {config.cta} <ExternalLink size={14} />
            </button>
          )}

          {showForm && (
            <form onSubmit={startKYC} className="mt-4 flex items-end gap-3">
              <div>
                <label className="label">First name</label>
                <input
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  className="input w-36"
                  placeholder="Ada"
                  required
                />
              </div>
              <div>
                <label className="label">Last name</label>
                <input
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  className="input w-36"
                  placeholder="Lovelace"
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading && <Loader2 size={14} className="animate-spin" />}
                Open KYC <ExternalLink size={14} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
