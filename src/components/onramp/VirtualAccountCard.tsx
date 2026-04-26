'use client'

import { useState } from 'react'
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { getCurrencyFlag, getRailLabel, shortAddress } from '@/lib/utils'

interface VirtualAccount {
  id: string
  currency: string
  status: string
  bankName: string | null
  bankAddress: string | null
  accountNumber: string | null
  routingNumber: string | null
  iban: string | null
  bic: string | null
  accountHolderName: string | null
  paymentRails: string[]
  destinationCurrency: string
  destinationRail: string
  destinationAddress: string
  developerFeePercent: string
  createdAt: Date
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-surface-3/50 last:border-0">
      <div>
        <p className="text-xs text-zinc-500">{label}</p>
        <p className="font-mono-custom text-sm text-zinc-200 mt-0.5">{value}</p>
      </div>
      <button onClick={copy} className="btn-ghost p-2 ml-3">
        {copied ? <Check size={14} className="text-brand-400" /> : <Copy size={14} />}
      </button>
    </div>
  )
}

export default function VirtualAccountCard({ account }: { account: VirtualAccount }) {
  const [expanded, setExpanded] = useState(false)
  const isUSD = account.currency === 'usd'

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-surface-3 rounded-xl flex items-center justify-center text-xl">
            {getCurrencyFlag(account.currency)}
          </div>
          <div>
            <p className="font-medium text-zinc-100">
              {account.currency.toUpperCase()} Virtual Account
            </p>
            <p className="text-xs text-zinc-500">
              → {account.destinationCurrency.toUpperCase()} on {account.destinationRail}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            {account.paymentRails.map(rail => (
              <span key={rail} className="badge text-zinc-400 bg-surface-3 border-surface-4 text-xs">
                {getRailLabel(rail)}
              </span>
            ))}
          </div>
          <span className="badge text-brand-400 bg-brand-950 border-brand-800 text-xs">
            <span className="status-dot bg-brand-400" />
            Active
          </span>
          <button
            onClick={() => setExpanded(e => !e)}
            className="btn-ghost p-2"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Deposit instructions */}
      {expanded && (
        <div className="mt-5 pt-5 border-t border-surface-3">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Deposit Instructions</p>
          <div className="bg-surface-2 rounded-lg px-4">
            {isUSD ? (
              <>
                {account.bankName && <CopyField label="Bank Name" value={account.bankName} />}
                {account.bankAddress && <CopyField label="Bank Address" value={account.bankAddress} />}
                {account.routingNumber && <CopyField label="Routing Number" value={account.routingNumber} />}
                {account.accountNumber && <CopyField label="Account Number" value={account.accountNumber} />}
                {account.accountHolderName && <CopyField label="Beneficiary Name" value={account.accountHolderName} />}
              </>
            ) : (
              <>
                {account.iban && <CopyField label="IBAN" value={account.iban} />}
                {account.bic && <CopyField label="BIC / SWIFT" value={account.bic} />}
                {account.bankName && <CopyField label="Bank Name" value={account.bankName} />}
                {account.accountHolderName && <CopyField label="Account Holder" value={account.accountHolderName} />}
              </>
            )}
          </div>

          <div className="mt-4 p-3 bg-surface-3 rounded-lg">
            <p className="text-xs text-zinc-500 mb-1">Crypto destination</p>
            <p className="font-mono-custom text-xs text-zinc-300">
              {account.destinationCurrency.toUpperCase()} → {account.destinationAddress}
            </p>
            <p className="text-xs text-zinc-600 mt-1">
              Developer fee: {account.developerFeePercent}%
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
