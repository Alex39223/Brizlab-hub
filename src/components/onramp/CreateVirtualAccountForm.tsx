'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2, Plus, DollarSign, Euro } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function CreateVirtualAccountForm({
  userId,
  bridgeCustomerId,
}: {
  userId: string
  bridgeCustomerId: string | null
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [currency, setCurrency] = useState<'usd' | 'eur'>('usd')
  const [destAddress, setDestAddress] = useState('')
  const [destCurrency, setDestCurrency] = useState<'usdc' | 'usdt' | 'eth'>('usdc')
  const [destRail, setDestRail] = useState<'ethereum' | 'polygon' | 'base'>('ethereum')

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/bridge/virtual-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currency,
          destinationAddress: destAddress,
          destinationCurrency: destCurrency,
          destinationRail: destRail,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(`${currency.toUpperCase()} virtual account created!`)
      router.refresh()
      setDestAddress('')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card gradient-border">
      <h2 className="font-display font-semibold text-zinc-100 mb-1">Create Virtual Account</h2>
      <p className="text-sm text-zinc-500 mb-6">
        A permanent bank account that auto-converts deposits to crypto
      </p>

      <form onSubmit={handleCreate} className="space-y-5">
        {/* Currency selector */}
        <div>
          <label className="label">Fiat Currency</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'usd', label: 'USD', sublabel: 'ACH / Wire', icon: DollarSign },
              { value: 'eur', label: 'EUR', sublabel: 'SEPA IBAN', icon: Euro },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setCurrency(opt.value as 'usd' | 'eur')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  currency === opt.value
                    ? 'border-brand-600 bg-brand-950/40 text-zinc-100'
                    : 'border-surface-4 bg-surface-2 text-zinc-400 hover:border-surface-4 hover:bg-surface-3'
                }`}
              >
                <opt.icon size={18} className={currency === opt.value ? 'text-brand-400 mb-2' : 'text-zinc-600 mb-2'} />
                <p className="font-medium">{opt.label}</p>
                <p className="text-xs text-zinc-500">{opt.sublabel}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Destination address */}
        <div>
          <label className="label">Destination Wallet Address (Ethereum)</label>
          <input
            type="text"
            value={destAddress}
            onChange={e => setDestAddress(e.target.value)}
            className="input font-mono-custom text-sm"
            placeholder="0x..."
            pattern="^0x[a-fA-F0-9]{40}$"
            required
          />
          <p className="text-xs text-zinc-600 mt-1">Where your crypto will be delivered after conversion</p>
        </div>

        {/* Destination currency + rail */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Receive as</label>
            <select
              value={destCurrency}
              onChange={e => setDestCurrency(e.target.value as 'usdc' | 'usdt' | 'eth')}
              className="input"
            >
              <option value="usdc">USDC</option>
              <option value="usdt">USDT</option>
              <option value="eth">ETH</option>
            </select>
          </div>
          <div>
            <label className="label">On chain</label>
            <select
              value={destRail}
              onChange={e => setDestRail(e.target.value as 'ethereum' | 'polygon' | 'base')}
              className="input"
            >
              <option value="ethereum">Ethereum</option>
              <option value="polygon">Polygon</option>
              <option value="base">Base</option>
            </select>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          {loading ? 'Creating...' : 'Create Virtual Account'}
        </button>
      </form>
    </div>
  )
}
