import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import NavAuthButton from './NavAuthButton'

export default async function Navbar() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="border-b border-arcade-border bg-arcade-bg/95 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="font-pixel text-arcade-cyan text-sm neon-text whitespace-nowrap"
        >
          ARCADE
        </Link>

        <div className="flex items-center gap-3">
          {user && (
            <Link href="/games/upload" className="btn-primary text-sm py-1.5 px-4">
              + 登録
            </Link>
          )}
          <NavAuthButton user={user} />
        </div>
      </div>
    </header>
  )
}
