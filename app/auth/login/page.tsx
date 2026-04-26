'use client'

import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('メールアドレスまたはパスワードが間違っています')
    } else {
      router.push(redirect)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {error && (
        <div className="bg-red-900/30 border border-red-500/50 text-red-400 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm text-gray-400 mb-1">メールアドレス</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field"
          placeholder="you@example.com"
          required
        />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">パスワード</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field"
          placeholder="••••••••"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full disabled:opacity-50"
      >
        {loading ? 'ログイン中...' : 'ログイン'}
      </button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-pixel text-arcade-cyan text-xl neon-text text-center mb-8">
          LOGIN
        </h1>
        <div className="bg-arcade-card border border-arcade-border rounded-xl p-6">
          <Suspense>
            <LoginForm />
          </Suspense>
          <p className="text-center text-gray-500 text-sm mt-6">
            アカウントをお持ちでない方は{' '}
            <Link href="/auth/signup" className="text-arcade-cyan hover:underline">
              新規登録
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
