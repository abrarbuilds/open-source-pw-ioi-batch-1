import type { Metadata } from 'next'
import { AuthProvider } from '@/lib/auth-context'
import './globals.css'

/** LOCKED FILE — Team 02 (Design System). */

export const metadata: Metadata = {
  title: 'Program Tracker',
  description: 'Class materials, assignments and attendance for your batch.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
