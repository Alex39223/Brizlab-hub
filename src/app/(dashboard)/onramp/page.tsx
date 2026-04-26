import { getUser } from '@/lib/supabase'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import CreateVirtualAccountForm from '@/components/onramp/CreateVirtualAccountForm'
import VirtualAccountCard from '@/components/onramp/VirtualAccountCard'
import KYCBanner from '@/components/dashboard/KYCBanner'

export default async function OnrampPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const dbUser = await prisma.user.findUnique({
    where: { supabaseUserId: user.id },
    include: {
      virtualAccounts: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!dbUser) redirect('/login')

  const kycApproved = dbUser.kycStatus === 'APPROVED'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="section-title">Onramp</h1>
        <p className="section-subtitle">
          Create virtual bank accounts to receive fiat and convert to USDC
        </p>
      </div>

      {!kycApproved && (
        <KYCBanner status={dbUser.kycStatus} />
      )}

      {kycApproved && (
        <CreateVirtualAccountForm userId={dbUser.id} bridgeCustomerId={dbUser.bridgeCustomerId} />
      )}

      {/* Existing virtual accounts */}
      {dbUser.virtualAccounts.length > 0 && (
        <div>
          <h2 className="font-display font-semibold text-zinc-100 mb-4">
            Your Virtual Accounts ({dbUser.virtualAccounts.length})
          </h2>
          <div className="grid gap-4">
            {dbUser.virtualAccounts.map((account) => (
              <VirtualAccountCard key={account.id} account={account} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
