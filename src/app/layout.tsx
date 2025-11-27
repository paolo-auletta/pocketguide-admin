import { type Metadata } from 'next'
import {
  ClerkProvider,
} from '@clerk/nextjs'
import { Poppins } from 'next/font/google'
import './globals.css'
import UserSyncProvider from '@/hooks/UserSyncProvider'
import { Analytics } from '@vercel/analytics/react'

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
})

export const metadata: Metadata = {
  title: 'Roamlit',
  description: 'Plan Your Perfect Journey',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${poppins.variable} antialiased`}>
          <UserSyncProvider>
            <Analytics />
            {children}
          </UserSyncProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}