import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyBridgeWebhook } from '@/lib/bridge'
import { BridgeWebhookEvent } from '@/types'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('x-bridge-signature') ?? ''
  const secret = process.env.BRIDGE_WEBHOOK_SECRET ?? ''

  // Verify signature
  if (secret && !verifyBridgeWebhook(body, signature, secret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event: BridgeWebhookEvent
  try {
    event = JSON.parse(body) as BridgeWebhookEvent
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Store raw event
  const webhookRecord = await prisma.webhookEvent.create({
    data: {
      eventType: event.type,
      bridgeId: event.id,
      payload: event as object,
      processed: false,
    },
  })

  try {
    await handleWebhookEvent(event)

    await prisma.webhookEvent.update({
      where: { id: webhookRecord.id },
      data: { processed: true },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    await prisma.webhookEvent.update({
      where: { id: webhookRecord.id },
      data: { error: msg },
    })
    console.error('Webhook processing error:', msg)
  }

  return NextResponse.json({ received: true })
}

async function handleWebhookEvent(event: BridgeWebhookEvent) {
  console.log(`Processing Bridge webhook: ${event.type}`, event.id)

  switch (event.type) {
    case 'virtual_account.deposit.pending':
      await handleDepositPending(event)
      break

    case 'virtual_account.deposit.completed':
      await handleDepositCompleted(event)
      break

    case 'virtual_account.deposit.failed':
      await handleDepositFailed(event)
      break

    case 'customer.kyc.approved':
      await handleKYCApproved(event)
      break

    case 'customer.kyc.rejected':
      await handleKYCRejected(event)
      break

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }
}

async function handleDepositPending(event: BridgeWebhookEvent) {
  const { virtual_account_id, deposit_id, amount, source } = event.data

  const virtualAccount = await prisma.virtualAccount.findUnique({
    where: { bridgeAccountId: virtual_account_id! },
  })
  if (!virtualAccount) return

  await prisma.transaction.upsert({
    where: { bridgeDepositId: deposit_id ?? `pending-${event.id}` },
    create: {
      userId: virtualAccount.userId,
      virtualAccountId: virtualAccount.id,
      bridgeDepositId: deposit_id,
      type: 'ONRAMP',
      status: 'PENDING',
      sourceCurrency: virtualAccount.currency,
      sourceAmount: amount ?? '0',
      destCurrency: virtualAccount.destinationCurrency,
      destAddress: virtualAccount.destinationAddress,
      paymentRail: source?.payment_rail,
      senderName: source?.sender_name,
      rawWebhook: event as object,
    },
    update: {
      status: 'PENDING',
      rawWebhook: event as object,
    },
  })
}

async function handleDepositCompleted(event: BridgeWebhookEvent) {
  const {
    virtual_account_id, deposit_id, amount,
    destination_tx_hash, developer_fee_amount,
    exchange_fee_amount, gas_fee, source
  } = event.data

  const virtualAccount = await prisma.virtualAccount.findUnique({
    where: { bridgeAccountId: virtual_account_id! },
  })
  if (!virtualAccount) return

  await prisma.transaction.upsert({
    where: { bridgeDepositId: deposit_id ?? `completed-${event.id}` },
    create: {
      userId: virtualAccount.userId,
      virtualAccountId: virtualAccount.id,
      bridgeDepositId: deposit_id,
      type: 'ONRAMP',
      status: 'COMPLETED',
      sourceCurrency: virtualAccount.currency,
      sourceAmount: amount ?? '0',
      destCurrency: virtualAccount.destinationCurrency,
      destAddress: virtualAccount.destinationAddress,
      txHash: destination_tx_hash,
      paymentRail: source?.payment_rail,
      senderName: source?.sender_name,
      developerFee: developer_fee_amount,
      exchangeFee: exchange_fee_amount,
      gasFeee: gas_fee,
      rawWebhook: event as object,
    },
    update: {
      status: 'COMPLETED',
      txHash: destination_tx_hash,
      developerFee: developer_fee_amount,
      exchangeFee: exchange_fee_amount,
      gasFeee: gas_fee,
      rawWebhook: event as object,
    },
  })
}

async function handleDepositFailed(event: BridgeWebhookEvent) {
  const { deposit_id } = event.data
  if (!deposit_id) return

  await prisma.transaction.updateMany({
    where: { bridgeDepositId: deposit_id },
    data: { status: 'FAILED', rawWebhook: event as object },
  })
}

async function handleKYCApproved(event: BridgeWebhookEvent) {
  const { customer_id } = event.data
  if (!customer_id) return

  await prisma.user.updateMany({
    where: { bridgeCustomerId: customer_id },
    data: { kycStatus: 'APPROVED' },
  })
}

async function handleKYCRejected(event: BridgeWebhookEvent) {
  const { customer_id } = event.data
  if (!customer_id) return

  await prisma.user.updateMany({
    where: { bridgeCustomerId: customer_id },
    data: { kycStatus: 'REJECTED' },
  })
}
