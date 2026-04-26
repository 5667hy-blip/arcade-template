'use client'

import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

export default function NavAuthButton({ user }: { user: User | null }) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (user) {
    return (
      <button onClick={handleSignOut} className="btn-secondary text-sm py-1.5 px-4">
        ログアウト
      </button>
    )
  }

  return (
    <Link href="/auth/login" className="btn-secondary text-sm py-1.5 px-4">
      ログイン
    </Link>
  )
}
