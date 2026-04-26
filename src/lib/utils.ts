import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { randomBytes, createHash } from 'crypto'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: string | number, currency = 'USD') {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(num)
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function shortAddress(address: string) {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function generateApiKey(): { key: string; hash: string; prefix: string } {
  const key = `brk_${randomBytes(32).toString('hex')}`
  const hash = createHash('sha256').update(key).digest('hex')
  const prefix = key.slice(0, 12)
  return { key, hash, prefix }
}

export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex')
}

export function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'approved':
    case 'activated':
      return 'text-brand-400 bg-brand-950 border-brand-800'
    case 'pending':
    case 'processing':
      return 'text-yellow-400 bg-yellow-950 border-yellow-800'
    case 'failed':
    case 'rejected':
      return 'text-red-400 bg-red-950 border-red-800'
    default:
      return 'text-zinc-400 bg-zinc-900 border-zinc-700'
  }
}

export function getCurrencyFlag(currency: string) {
  switch (currency.toLowerCase()) {
    case 'usd': return '🇺🇸'
    case 'eur': return '🇪🇺'
    case 'gbp': return '🇬🇧'
    case 'brl': return '🇧🇷'
    default: return '💱'
  }
}

export function getRailLabel(rail: string) {
  switch (rail?.toLowerCase()) {
    case 'ach_push': return 'ACH'
    case 'wire': return 'Wire'
    case 'sepa': return 'SEPA'
    default: return rail?.toUpperCase() ?? 'Unknown'
  }
}
