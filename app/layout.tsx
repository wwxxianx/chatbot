import Providers from '@/providers/Providers'
import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import NavBar from '@/components/NavBar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Chatbot GPT',
  description: 'For interview test assessment only',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="h-[100dvh]">
        <Providers>
          <NavBar />
          {children}
        </Providers>
      </body>
    </html>
  )
}
