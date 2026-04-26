import { getUser } from '@/lib/supabase'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import ApiKeyManager from '@/components/admin/ApiKeyManager'
import { formatDate } from '@/lib/utils'

export default async function AdminSettingsPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const dbUser = await prisma.user.findUnique({
    where: { supabaseUserId: user.id },
    include: {
      apiKeys: {
        orderBy: { createdAt: 'desc' },
        where: { isActive: true },
      },
    },
  })
  if (!dbUser) redirect('/login')

  const apiKeys = dbUser.apiKeys.map(k => ({
    id: k.id,
    name: k.name,
    keyPrefix: k.keyPrefix,
    lastUsedAt: k.lastUsedAt,
    expiresAt: k.expiresAt,
    createdAt: k.createdAt,
    isActive: k.isActive,
  }))

  return (
    <div className="space-y-10">
      <div>
        <h1 className="section-title">Settings</h1>
        <p className="section-subtitle">Manage your account and API access</p>
      </div>

      {/* Account info */}
      <section>
        <h2 className="font-display font-semibold text-zinc-100 mb-4">Account</h2>
        <div className="card space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Name</label>
              <p className="text-zinc-300">{dbUser.name ?? '—'}</p>
            </div>
            <div>
              <label className="label">Email</label>
              <p className="text-zinc-300">{dbUser.email}</p>
            </div>
            <div>
              <label className="label">KYC Status</label>
              <p className="text-zinc-300">{dbUser.kycStatus}</p>
            </div>
            <div>
              <label className="label">Bridge Customer ID</label>
              <p className="font-mono-custom text-zinc-500 text-sm">
                {dbUser.bridgeCustomerId ?? 'Not created yet'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* API Keys */}
      <section id="api-keys">
        <h2 className="font-display font-semibold text-zinc-100 mb-2">API Keys</h2>
        <p className="text-sm text-zinc-500 mb-4">
          Use API keys to integrate OnRamp into your own product via the B2B API.
          Keys are prefixed with <code className="font-mono-custom text-brand-400">brk_</code>
        </p>
        <ApiKeyManager userId={dbUser.id} initialKeys={apiKeys} />
      </section>

      {/* API Docs */}
      <section>
        <h2 className="font-display font-semibold text-zinc-100 mb-4">B2B API Reference</h2>
        <div className="card space-y-4 font-mono-custom text-sm">
          <div>
            <p className="text-zinc-500 text-xs mb-2">Base URL</p>
            <code className="text-brand-400">{process.env.NEXT_PUBLIC_APP_URL ?? 'https://your-app.vercel.app'}/api/v1</code>
          </div>
          <div className="border-t border-surface-3 pt-4 space-y-3">
            {[
              { method: 'POST', path: '/customers', desc: 'Create a Bridge customer + KYC link' },
              { method: 'GET',  path: '/customers/:id', desc: 'Get customer KYC status' },
              { method: 'POST', path: '/virtual-accounts', desc: 'Create a virtual account (USD or EUR)' },
              { method: 'GET',  path: '/virtual-accounts/:id', desc: 'Get virtual account deposit details' },
              { method: 'GET',  path: '/transactions', desc: 'List all transactions' },
            ].map(route => (
              <div key={route.path} className="flex items-start gap-3">
                <span className={`badge shrink-0 mt-0.5 ${
                  route.method === 'POST' ? 'text-blue-400 bg-blue-950 border-blue-800' : 'text-brand-400 bg-brand-950 border-brand-800'
                }`}>
                  {route.method}
                </span>
                <div>
                  <code className="text-zinc-200">{route.path}</code>
                  <p className="text-zinc-500 text-xs mt-0.5 font-sans">{route.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-surface-3 pt-4">
            <p className="text-zinc-500 text-xs mb-2">Authentication header</p>
            <code className="text-zinc-300">Authorization: Bearer brk_your_api_key</code>
          </div>
        </div>
      </section>
    </div>
  )
}
