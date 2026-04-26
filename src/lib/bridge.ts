// ============================================
// BRIDGE.XYZ API CLIENT
// ============================================

import {
  BridgeCustomer,
  BridgeKYCLink,
  BridgeVirtualAccount,
  SupportedCurrency,
  DestinationCurrency,
  BlockchainRail,
} from '@/types'

const BRIDGE_API_URL = process.env.BRIDGE_API_URL || 'https://api.bridge.xyz'
const BRIDGE_API_KEY = process.env.BRIDGE_API_KEY!

if (!BRIDGE_API_KEY) {
  console.warn('⚠️  BRIDGE_API_KEY is not set. Bridge API calls will fail.')
}

// ─── Base Fetcher ─────────────────────────────────────────────────────────────

async function bridgeFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  idempotencyKey?: string
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Api-Key': BRIDGE_API_KEY,
    ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
    ...(options.headers as Record<string, string>),
  }

  const res = await fetch(`${BRIDGE_API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(
      `Bridge API error [${res.status}] ${endpoint}: ${JSON.stringify(error)}`
    )
  }

  return res.json() as Promise<T>
}

// ─── Customers ────────────────────────────────────────────────────────────────

export async function createBridgeCustomer(data: {
  first_name: string
  last_name: string
  email: string
  type?: 'individual' | 'business'
}): Promise<BridgeCustomer> {
  return bridgeFetch<BridgeCustomer>(
    '/v0/customers',
    {
      method: 'POST',
      body: JSON.stringify({
        type: 'individual',
        ...data,
      }),
    },
    `create-customer-${data.email}`
  )
}

export async function getBridgeCustomer(customerId: string): Promise<BridgeCustomer> {
  return bridgeFetch<BridgeCustomer>(`/v0/customers/${customerId}`)
}

export async function listBridgeCustomers(): Promise<{ data: BridgeCustomer[] }> {
  return bridgeFetch<{ data: BridgeCustomer[] }>('/v0/customers')
}

// ─── KYC ─────────────────────────────────────────────────────────────────────

export async function createKYCLink(
  customerId: string,
  redirectUri?: string
): Promise<BridgeKYCLink> {
  return bridgeFetch<BridgeKYCLink>(
    `/v0/customers/${customerId}/kyc_links`,
    {
      method: 'POST',
      body: JSON.stringify({
        full_name: '',
        email: '',
        type: 'individual',
        ...(redirectUri ? { redirect_uri: redirectUri } : {}),
      }),
    },
    `kyc-link-${customerId}-${Date.now()}`
  )
}

export async function getKYCStatus(customerId: string): Promise<BridgeCustomer> {
  return bridgeFetch<BridgeCustomer>(`/v0/customers/${customerId}`)
}

// ─── Virtual Accounts ─────────────────────────────────────────────────────────

export async function createVirtualAccount(
  customerId: string,
  data: {
    currency: SupportedCurrency
    destinationAddress: string
    destinationCurrency: DestinationCurrency
    destinationRail: BlockchainRail
    developerFeePercent?: string
  }
): Promise<BridgeVirtualAccount> {
  const feePercent =
    data.developerFeePercent ?? process.env.DEVELOPER_FEE_PERCENT ?? '1.0'

  return bridgeFetch<BridgeVirtualAccount>(
    `/v0/customers/${customerId}/virtual_accounts`,
    {
      method: 'POST',
      body: JSON.stringify({
        source: {
          currency: data.currency,
        },
        destination: {
          payment_rail: data.destinationRail,
          currency: data.destinationCurrency,
          address: data.destinationAddress,
        },
        developer_fee_percent: feePercent,
      }),
    },
    `va-${customerId}-${data.currency}-${Date.now()}`
  )
}

export async function getVirtualAccount(
  customerId: string,
  virtualAccountId: string
): Promise<BridgeVirtualAccount> {
  return bridgeFetch<BridgeVirtualAccount>(
    `/v0/customers/${customerId}/virtual_accounts/${virtualAccountId}`
  )
}

export async function listVirtualAccounts(
  customerId: string
): Promise<{ data: BridgeVirtualAccount[] }> {
  return bridgeFetch<{ data: BridgeVirtualAccount[] }>(
    `/v0/customers/${customerId}/virtual_accounts`
  )
}

// ─── Webhook Verification ─────────────────────────────────────────────────────

export function verifyBridgeWebhook(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const crypto = require('crypto')
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSig)
    )
  } catch {
    return false
  }
}
