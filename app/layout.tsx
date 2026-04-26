import type { Metadata, Viewport } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'ARCADE — HTML5ゲームセンター',
  description: '誰でもゲームを登録・プレイできるブラウザゲームセンター',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-arcade-border py-6 text-center text-gray-600 text-sm">
          ARCADE — Built with Next.js & Supabase
        </footer>
      </body>
    </html>
  )
}
