// ============================================
// BRIDGE ONRAMP - Global Types
// ============================================

export type UserRole = 'USER' | 'ADMIN'
export type KYCStatus = 'NOT_STARTED' | 'PENDING' | 'APPROVED' | 'REJECTED'
export type TransactionStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
export type TransactionType = 'ONRAMP' | 'OFFRAMP'
export type SupportedCurrency = 'usd' | 'eur'
export type DestinationCurrency = 'usdc' | 'usdt' | 'eth'
export type PaymentRail = 'ach_push' | 'wire' | 'sepa'
export type BlockchainRail = 'ethereum' | 'polygon' | 'base' | 'solana'

// ─── Bridge API Types ────────────────────────────────────────────────────────

export interface BridgeCustomer {
  id: string
  first_name: string
  last_name: string
  email: string
  type: 'individual' | 'business'
  kyc_status: 'approved' | 'pending' | 'rejected' | 'not_started'
  created_at: string
}

export interface BridgeKYCLink {
  id: string
  url: string
  customer_id: string
  kyc_status: string
  created_at: string
}

export interface BridgeVirtualAccount {
  id: string
  status: 'activated' | 'inactive'
  developer_fee_percent: string
  customer_id: string
  created_at: string
  source_deposit_instructions: USDDepositInstructions | EURDepositInstructions
  destination: {
    currency: string
    payment_rail: string
    address: string
  }
}

export interface USDDepositInstructions {
  currency: 'usd'
  bank_name: string
  bank_address: string
  bank_routing_number: string
  bank_account_number: string
  bank_beneficiary_name: string
  bank_beneficiary_address: string
  payment_rail: 'ach_push'
  payment_rails: string[]
}

export interface EURDepositInstructions {
  currency: 'eur'
  iban: string
  bic: string
  account_holder_name: string
  bank_name: string
  bank_address: string
  payment_rail: 'sepa'
  payment_rails: string[]
}

export interface BridgeWebhookEvent {
  id: string
  type: string
  created_at: string
  data: {
    virtual_account_id?: string
    customer_id?: string
    deposit_id?: string
    amount?: string
    developer_fee_amount?: string
    exchange_fee_amount?: string
    subtotal_amount?: string
    gas_fee?: string
    source?: {
      payment_rail: string
      description?: string
      sender_name?: string
      sender_bank_routing_number?: string
      trace_number?: string
    }
    destination_tx_hash?: string
  }
}

// ─── App Types ───────────────────────────────────────────────────────────────

export interface DashboardStats {
  totalUsers: number
  totalTransactions: number
  totalVolumeUSD: number
  totalFeesEarned: number
  pendingKYC: number
  activeVirtualAccounts: number
}

export interface TransactionWithUser {
  id: string
  userId: string
  sourceCurrency: string
  sourceAmount: string
  destCurrency: string
  destAmount: string | null
  destAddress: string
  status: TransactionStatus
  paymentRail: string | null
  txHash: string | null
  createdAt: Date
  user: {
    email: string
    name: string | null
  }
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface CreateOnrampPayload {
  currency: SupportedCurrency
  destinationAddress: string
  destinationCurrency: DestinationCurrency
  destinationRail: BlockchainRail
}

export interface ApiKeyPublic {
  id: string
  name: string
  keyPrefix: string
  lastUsedAt: Date | null
  expiresAt: Date | null
  createdAt: Date
  isActive: boolean
}
