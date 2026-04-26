import { getUser } from '@/lib/supabase'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { formatDate, getStatusColor } from '@/lib/utils'

export default async function AdminUsersPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const dbUser = await prisma.user.findUnique({ where: { supabaseUserId: user.id } })
  if (!dbUser || dbUser.role !== 'ADMIN') redirect('/dashboard')

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { transactions: true, virtualAccounts: true } },
    },
  })

  const stats = {
    total: users.length,
    approved: users.filter(u => u.kycStatus === 'APPROVED').length,
    pending: users.filter(u => u.kycStatus === 'PENDING').length,
    notStarted: users.filter(u => u.kycStatus === 'NOT_STARTED').length,
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="section-title">Users</h1>
        <p className="section-subtitle">Manage all registered users and their KYC status</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.total },
          { label: 'KYC Approved', value: stats.approved },
          { label: 'KYC Pending', value: stats.pending },
          { label: 'Not Started', value: stats.notStarted },
        ].map(s => (
          <div key={s.label} className="card">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">{s.label}</p>
            <p className="stat-value">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Users table */}
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-3">
              {['User', 'Role', 'KYC', 'Accounts', 'Transactions', 'Joined'].map(h => (
                <th key={h} className="text-left text-xs text-zinc-500 font-medium px-5 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-surface-3/50 hover:bg-surface-2/30 transition-colors">
                <td className="px-5 py-3.5">
                  <div>
                    <p className="text-zinc-100 font-medium">{u.name ?? '—'}</p>
                    <p className="text-xs text-zinc-500">{u.email}</p>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`badge ${u.role === 'ADMIN' ? 'text-purple-400 bg-purple-950 border-purple-800' : 'text-zinc-400 bg-zinc-900 border-zinc-700'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`badge ${getStatusColor(u.kycStatus)}`}>
                    <span className={`status-dot ${
                      u.kycStatus === 'APPROVED' ? 'bg-brand-400' :
                      u.kycStatus === 'PENDING' ? 'bg-yellow-400' :
                      u.kycStatus === 'REJECTED' ? 'bg-red-400' : 'bg-zinc-600'
                    }`} />
                    {u.kycStatus}
                  </span>
                </td>
                <td className="px-5 py-3.5 font-mono-custom text-zinc-400">
                  {u._count.virtualAccounts}
                </td>
                <td className="px-5 py-3.5 font-mono-custom text-zinc-400">
                  {u._count.transactions}
                </td>
                <td className="px-5 py-3.5 text-zinc-500 text-xs">
                  {formatDate(u.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
