export const dynamic = 'force-dynamic'

import { getUser } from '@/lib/supabase'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency, getStatusColor, shortAddress, formatDate } from '@/lib/utils'
import { ArrowRight, TrendingUp, Wallet, DollarSign, AlertCircle } from 'lucide-react'
import KYCBanner from '@/components/dashboard/KYCBanner'

export default async function DashboardPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const dbUser = await prisma.user.findUnique({
    where: { supabaseUserId: user.id },
    include: {
      transactions: { orderBy: { createdAt: 'desc' }, take: 5 },
      virtualAccounts: true,
    },
  })

  if (!dbUser) redirect('/login')

  const totalVolume = dbUser.transactions
    .filter(t => t.status === 'COMPLETED')
    .reduce((sum, t) => sum + parseFloat(t.sourceAmount || '0'), 0)

  const completedCount = dbUser.transactions.filter(t => t.status === 'COMPLETED').length
  const pendingCount = dbUser.transactions.filter(t => t.status === 'PENDING').length

  const stats = [
    { label: 'Total Volume', value: formatCurrency(totalVolume), icon: TrendingUp, color: 'text-brand-400' },
    { label: 'Completed Tx', value: completedCount.toString(), icon: DollarSign, color: 'text-blue-400' },
    { label: 'Pending Tx', value: pendingCount.toString(), icon: AlertCircle, color: 'text-yellow-400' },
    { label: 'Virtual Accounts', value: dbUser.virtualAccounts.length.toString(), icon: Wallet, color: 'text-purple-400' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="section-title">Good day, {dbUser.name?.split(' ')[0] ?? 'there'} 👋</h1>
        <p className="section-subtitle">Here&apos;s your onramp activity overview</p>
      </div>

      {dbUser.kycStatus !== 'APPROVED' && <KYCBanner status={dbUser.kycStatus} />}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-zinc-500 uppercase tracking-wider">{stat.label}</p>
              <stat.icon size={16} className={stat.color} />
            </div>
            <p className="stat-value">{stat.value}</p>
          </div>
        ))}
      </div>

      {dbUser.kycStatus === 'APPROVED' && dbUser.virtualAccounts.length === 0 && (
        <div className="card gradient-border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold text-zinc-100">Set up your first onramp</h3>
              <p className="text-sm text-zinc-500 mt-1">Create a virtual bank account to start receiving fiat</p>
            </div>
            <Link href="/onramp" className="btn-primary shrink-0">Get started <ArrowRight size={16} /></Link>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-zinc-100">Recent Transactions</h2>
          <Link href="/transactions" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {dbUser.transactions.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-zinc-500">No transactions yet.</p>
          </div>
        ) : (
          <div className="card p-0 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-3">
                  {['Amount', 'Destination', 'Rail', 'Status', 'Date'].map(h => (
                    <th key={h} className="text-left text-xs text-zinc-500 font-medium px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dbUser.transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-surface-3/50 hover:bg-surface-2/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-mono-custom text-zinc-100">{formatCurrency(tx.sourceAmount, tx.sourceCurrency.toUpperCase())}</span>
                    </td>
                    <td className="px-5 py-3.5 font-mono-custom text-zinc-400 text-xs">{shortAddress(tx.destAddress)}</td>
                    <td className="px-5 py-3.5 text-zinc-400">{tx.paymentRail?.toUpperCase() ?? '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className={`badge ${getStatusColor(tx.status)}`}>
                        <span className={`status-dot ${tx.status === 'COMPLETED' ? 'bg-brand-400' : tx.status === 'PENDING' ? 'bg-yellow-400' : 'bg-red-400'}`} />
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-zinc-500 text-xs">{formatDate(tx.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
