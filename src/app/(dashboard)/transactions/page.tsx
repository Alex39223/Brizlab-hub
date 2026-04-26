import { getUser } from '@/lib/supabase'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { formatCurrency, getStatusColor, shortAddress, formatDate, getRailLabel } from '@/lib/utils'

export default async function TransactionsPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const dbUser = await prisma.user.findUnique({
    where: { supabaseUserId: user.id },
  })
  if (!dbUser) redirect('/login')

  const transactions = await prisma.transaction.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: 'desc' },
    include: { virtualAccount: true },
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="section-title">Transactions</h1>
        <p className="section-subtitle">Full history of your onramp activity</p>
      </div>

      {transactions.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-zinc-400 font-medium">No transactions yet</p>
          <p className="text-sm text-zinc-600 mt-2">
            Transactions will appear here once you fund a virtual account
          </p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-3">
                {['ID', 'Source', 'Destination', 'Rail', 'Tx Hash', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left text-xs text-zinc-500 font-medium px-5 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr
                  key={tx.id}
                  className="border-b border-surface-3/50 hover:bg-surface-2/30 transition-colors"
                >
                  <td className="px-5 py-3.5 font-mono-custom text-zinc-600 text-xs">
                    {tx.id.slice(0, 8)}...
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono-custom text-zinc-100">
                      {formatCurrency(tx.sourceAmount, tx.sourceCurrency.toUpperCase())}
                    </span>
                    <span className="text-zinc-600 ml-1 text-xs uppercase">{tx.sourceCurrency}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div>
                      <span className="font-mono-custom text-zinc-400 text-xs">
                        {shortAddress(tx.destAddress)}
                      </span>
                      <span className="text-zinc-600 ml-1 text-xs uppercase">{tx.destCurrency}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-zinc-400 text-xs">
                    {tx.paymentRail ? getRailLabel(tx.paymentRail) : '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    {tx.txHash ? (
                      <a
                        href={`https://etherscan.io/tx/${tx.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono-custom text-brand-400 hover:text-brand-300 text-xs"
                      >
                        {shortAddress(tx.txHash)}
                      </a>
                    ) : (
                      <span className="text-zinc-700 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`badge ${getStatusColor(tx.status)}`}>
                      <span className={`status-dot ${
                        tx.status === 'COMPLETED' ? 'bg-brand-400' :
                        tx.status === 'PENDING' ? 'bg-yellow-400' :
                        tx.status === 'PROCESSING' ? 'bg-blue-400' :
                        'bg-red-400'
                      }`} />
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-zinc-500 text-xs whitespace-nowrap">
                    {formatDate(tx.createdAt)}
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
