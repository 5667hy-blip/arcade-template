import { createClient } from '@/lib/supabase/server'
import GameCard from '@/components/GameCard'
import type { Game } from '@/lib/supabase/types'
import Link from 'next/link'

export const revalidate = 60

export default async function HomePage({
  searchParams,
}: {
  searchParams: { q?: string; tag?: string }
}) {
  const supabase = createClient()

  let query = supabase
    .from('games')
    .select('*')
    .order('created_at', { ascending: false })

  if (searchParams.q) {
    query = query.ilike('title', `%${searchParams.q}%`)
  }
  if (searchParams.tag) {
    query = query.contains('tags', [searchParams.tag])
  }

  const { data: games } = await query.returns<Game[]>()

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="text-center mb-10">
        <h1
          className="font-pixel text-2xl md:text-4xl text-arcade-cyan neon-text mb-3"
          style={{ letterSpacing: '0.05em' }}
        >
          ARCADE
        </h1>
        <p className="text-gray-400 text-sm">ブラウザで遊べるHTML5ゲームセンター</p>
      </div>

      {/* 検索バー */}
      <form className="flex gap-2 mb-8 max-w-md mx-auto">
        <input
          type="text"
          name="q"
          defaultValue={searchParams.q}
          placeholder="ゲームを検索..."
          className="input-field flex-1"
        />
        <button type="submit" className="btn-primary whitespace-nowrap">
          検索
        </button>
      </form>

      {/* ゲームグリッド */}
      {games && games.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500">
          <p className="text-4xl mb-4">🎮</p>
          <p className="mb-6">まだゲームがありません</p>
          <Link href="/games/upload" className="btn-primary inline-block">
            最初のゲームを登録する
          </Link>
        </div>
      )}
    </div>
  )
}
