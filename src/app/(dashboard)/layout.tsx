import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUser } from '@/lib/supabase'
import { prisma } from '@/lib/prisma'
import {
  LayoutDashboard, ArrowDownUp, Receipt, Settings,
  Users, Zap, Code2
} from 'lucide-react'
import LogoutButton from '@/components/dashboard/LogoutButton'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/onramp', label: 'Onramp', icon: ArrowDownUp },
  { href: '/transactions', label: 'Transactions', icon: Receipt },
]

const devItems = [
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()
  if (!user) redirect('/login')

  const dbUser = await prisma.user.findUnique({
    where: { supabaseUserId: user.id },
  })

  const isAdmin = dbUser?.role === 'ADMIN'

  return (
    <div className="flex h-screen bg-surface-0 overflow-hidden">
      <aside className="w-60 border-r border-surface-3 flex flex-col shrink-0">
        <div className="h-16 border-b border-surface-3 flex items-center px-5">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
              <Zap size={14} className="text-white" />
            </div>
            <span className="font-display font-bold text-zinc-100">OnRamp</span>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider px-2 mb-2">Product</p>
          {navItems.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} icon={item.icon} />
          ))}

          {isAdmin && (
            <div className="pt-4">
              <p className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider px-2 mb-2">Admin</p>
              {devItems.map((item) => (
                <NavLink key={item.href} href={item.href} label={item.label} icon={item.icon} />
              ))}
            </div>
          )}

          <div className="pt-4">
            <p className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider px-2 mb-2">Developers</p>
            <NavLink href="/admin/settings#api-keys" label="API Keys" icon={Code2} />
          </div>
        </nav>

        <div className="border-t border-surface-3 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-brand-900 border border-brand-700 rounded-full flex items-center justify-center shrink-0">
              <span className="text-brand-400 text-xs font-bold">
                {(dbUser?.name ?? user.email ?? '?')[0].toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-