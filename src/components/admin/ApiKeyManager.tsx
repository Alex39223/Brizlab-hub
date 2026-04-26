'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2, Loader2, Key, Copy, Check, Eye, EyeOff } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { ApiKeyPublic } from '@/types'

export default function ApiKeyManager({
  userId,
  initialKeys,
}: {
  userId: string
  initialKeys: ApiKeyPublic[]
}) {
  const [keys, setKeys] = useState<ApiKeyPublic[]>(initialKeys)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [newKey, setNewKey] = useState<string | null>(null)
  const [showKey, setShowKey] = useState(false)
  const [copied, setCopied] = useState(false)

  async function createKey(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setNewKey(data.data.key)
      setKeys(prev => [{
        id: 'new',
        name,
        keyPrefix: data.data.prefix,
        lastUsedAt: null,
        expiresAt: null,
        createdAt: new Date(),
        isActive: true,
      }, ...prev])
      setName('')
      toast.success('API key created!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed')
    } finally {
      setLoading(false)
    }
  }

  async function revokeKey(id: string) {
    try {
      const res = await fetch(`/api/admin/api-keys?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      setKeys(prev => prev.filter(k => k.id !== id))
      toast.success('Key revoked')
    } catch {
      toast.error('Failed to revoke key')
    }
  }

  function copyKey() {
    if (!newKey) return
    navigator.clipboard.writeText(newKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      {/* New key reveal banner */}
      {newKey && (
        <div className="card border-brand-700 bg-brand-950/20">
          <div className="flex items-start gap-3">
            <Key size={18} className="text-brand-400 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-brand-300 mb-1">
                Copy your API key now — it won&apos;t be shown again
              </p>
              <div className="flex items-center gap-2 bg-surface-3 rounded-lg px-3 py-2 mt-2">
                <code className="font-mono-custom text-xs text-zinc-200 flex-1 truncate">
                  {showKey ? newKey : newKey.replace(/./g, '•').slice(0, 40) + '...'}
                </code>
                <button onClick={() => setShowKey(v => !v)} className="btn-ghost p-1">
                  {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button onClick={copyKey} className="btn-ghost p-1">
                  {copied ? <Check size={14} className="text-brand-400" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
            <button onClick={() => setNewKey(null)} className="text-zinc-600 hover:text-zinc-400 text-xs">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Create form */}
      <form onSubmit={createKey} className="card flex items-end gap-3">
        <div className="flex-1">
          <label className="label">Key name</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="input"
            placeholder="e.g. Production, Staging, My App"
            required
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary shrink-0">
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          Create key
        </button>
      </form>

      {/* Keys list */}
      {keys.length === 0 ? (
        <div className="card text-center py-8 text-zinc-500 text-sm">
          No API keys yet. Create one above.
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-3">
                {['Name', 'Key prefix', 'Last used', 'Created', ''].map(h => (
                  <th key={h} className="text-left text-xs text-zinc-500 font-medium px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {keys.map((key) => (
                <tr key={key.id} className="border-b border-surface-3/50 hover:bg-surface-2/30 transition-colors">
                  <td className="px-5 py-3.5 text-zinc-200 font-medium">{key.name}</td>
                  <td className="px-5 py-3.5">
                    <code className="font-mono-custom text-zinc-400 text-xs bg-surface-3 px-2 py-0.5 rounded">
                      {key.keyPrefix}...
                    </code>
                  </td>
                  <td className="px-5 py-3.5 text-zinc-500 text-xs">
                    {key.lastUsedAt ? formatDate(key.lastUsedAt) : 'Never'}
                  </td>
                  <td className="px-5 py-3.5 text-zinc-500 text-xs">
                    {formatDate(key.createdAt)}
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => revokeKey(key.id)}
                      className="btn-ghost text-red-500 hover:text-red-400 p-1.5"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
