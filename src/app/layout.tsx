import type { Metadata } from 'next'
import { Toaster } from 'sonner'
import './globals.css'

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
        <link href="https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,400&family=Syne:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-surface-0 text-zinc-100 antialiased font-sans">
        {children}
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#181c22',
              border: '1px solid #252c38',
              color: '#f4f4f5',
            },
          }}
        />
      </body>
    </html>
  )
}
