'use client'

import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${location.origin}/` },
    })

    if (error) {
      setError(error.message)
    } else {
      setDone(true)
    }
    setLoading(false)
  }

  if (done) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-4xl mb-4">📧</p>
          <h2 className="text-arcade-cyan text-lg font-bold mb-2">確認メールを送信しました</h2>
          <p className="text-gray-400 text-sm">
            {email} に届いたリンクをクリックして登録を完了してください
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-pixel text-arcade-pink neon-text text-xl text-center mb-8"
          style={{ textShadow: '0 0 10px #ff2d78, 0 0 20px #ff2d7840' }}>
          SIGN UP
        </h1>
        <div className="bg-arcade-card border border-arcade-border rounded-xl p-6">
          <form onSubmit={handleSignup} className="space-y-4">
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
              <label className="block text-sm text-gray-400 mb-1">パスワード（6文字以上）</label>
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
              className="w-full py-2 px-6 bg-arcade-pink text-white font-bold rounded
                         hover:shadow-neon-pink transition-all duration-200 active:scale-95 disabled:opacity-50"
              style={{ boxShadow: loading ? 'none' : undefined }}
            >
              {loading ? '登録中...' : '新規登録'}
            </button>
          </form>
          <p className="text-center text-gray-500 text-sm mt-6">
            すでにアカウントをお持ちの方は{' '}
            <Link href="/auth/login" className="text-arcade-cyan hover:underline">
              ログイン
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
