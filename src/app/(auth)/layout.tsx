import { Zap } from 'lucide-react'
import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen gradient-mesh grid-overlay flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mb-8 w-fit mx-auto group">
          <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center group-hover:bg-brand-400 transition-colors">
            <Zap size={18} className="text-white" />
          </div>
          <span className="font-display font-bold text-zinc-100 text-xl">OnRamp</span>
        </Link>

        {children}
      </div>
    </div>
  )
}
