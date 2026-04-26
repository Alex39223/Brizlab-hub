import Link from 'next/link'
import { ArrowRight, Zap, Shield, Globe, Code2, ChevronRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen gradient-mesh grid-overlay">
      {/* Nav */}
      <nav className="border-b border-surface-3/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-zinc-100 text-lg">OnRamp</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-ghost text-sm">Sign in</Link>
            <Link href="/register" className="btn-primary text-sm">Get started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-950 border border-brand-800 rounded-full text-brand-400 text-xs font-medium mb-8">
            <span className="status-dot bg-brand-400 live-pulse" />
            Powered by Bridge.xyz — Acquired by Stripe
          </div>

          <h1 className="font-display text-6xl font-bold text-zinc-50 leading-[1.05] tracking-tight mb-6">
            Fiat to crypto.<br />
            <span className="text-brand-400">Done right.</span>
          </h1>

          <p className="text-xl text-zinc-400 leading-relaxed mb-10 max-w-xl">
            Accept USD via ACH/Wire and EUR via SEPA. Convert to USDC on-chain automatically.
            Built on Bridge infrastructure — regulatory-compliant, developer-first.
          </p>

          <div className="flex items-center gap-4">
            <Link href="/register" className="btn-primary text-base px-6 py-3">
              Start for free <ArrowRight size={18} />
            </Link>
            <Link href="#api" className="btn-secondary text-base px-6 py-3">
              <Code2 size={16} /> View API docs
            </Link>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-20 grid grid-cols-3 gap-8 max-w-2xl">
          {[
            { label: 'Settlement time', value: 'Minutes' },
            { label: 'Developer fee', value: 'You set it' },
            { label: 'KYC handled by', value: 'Bridge' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl font-mono-custom font-medium text-brand-400">{stat.value}</div>
              <div className="text-sm text-zinc-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-surface-3">
        <div className="grid grid-cols-3 gap-6">
          {[
            {
              icon: Globe,
              title: 'USD + EUR support',
              desc: 'ACH, Wire for USD. SEPA IBAN for EUR. More rails coming: BRL, GBP, MXN.',
            },
            {
              icon: Shield,
              title: 'Compliance included',
              desc: 'Bridge handles KYC/AML, sanctions screening, and regulatory requirements. You stay clean.',
            },
            {
              icon: Code2,
              title: 'B2B API',
              desc: 'Generate API keys, embed our onramp in your product. Full webhook support for transaction events.',
            },
          ].map((f) => (
            <div key={f.title} className="card gradient-border">
              <f.icon size={24} className="text-brand-400 mb-4" />
              <h3 className="font-display font-semibold text-zinc-100 mb-2">{f.title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Flow diagram */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-surface-3">
        <h2 className="font-display text-3xl font-bold text-zinc-100 mb-12">How it works</h2>
        <div className="flex items-center gap-3 flex-wrap">
          {[
            { step: '01', label: 'User signs up & KYC' },
            { step: '02', label: 'Virtual bank account created' },
            { step: '03', label: 'User sends fiat via ACH/SEPA' },
            { step: '04', label: 'Bridge converts to USDC' },
            { step: '05', label: 'Crypto lands in wallet' },
          ].map((item, i, arr) => (
            <div key={item.step} className="flex items-center gap-3">
              <div className="card-sm flex items-center gap-3 min-w-0">
                <span className="font-mono-custom text-brand-400 text-sm">{item.step}</span>
                <span className="text-sm text-zinc-300 whitespace-nowrap">{item.label}</span>
              </div>
              {i < arr.length - 1 && <ChevronRight size={16} className="text-zinc-700 shrink-0" />}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-3 py-10">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <span className="text-sm text-zinc-600">© 2025 OnRamp. Built on Bridge.xyz infrastructure.</span>
          <div className="flex gap-6 text-sm text-zinc-600">
            <Link href="/login" className="hover:text-zinc-400 transition-colors">Sign in</Link>
            <Link href="/register" className="hover:text-zinc-400 transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
