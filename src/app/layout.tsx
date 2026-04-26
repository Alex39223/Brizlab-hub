import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import './globals.css'
import React from 'react'

export const metadata: Metadata = {
  title: 'Bridge Onramp — Stablecoin Infrastructure',
  description: 'Convert fiat to crypto seamlessly with Bridge virtual accounts. USD via ACH/Wire, EUR via SEPA.',
  keywords: ['crypto onramp', 'stablecoin', 'USDC', 'Bridge API', 'fiat to crypto'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght