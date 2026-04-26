import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Game } from '@/lib/supabase/types'
import GamePlayer from './GamePlayer'

export default async function GamePage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  // まずgamesだけ取得（profilesジョインを別にすることで片方が欠けても動く）
  const { data: game, error } = await supabase
    .from('games')
    .select('*')
    .eq('id', params.id)
    .single<Game>()

  if (error) {
    console.error('Game fetch error:', error)
    notFound()
  }
  if (!game) notFound()

  // profilesは別クエリで取得（テーブルがなくても落ちない）
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', game.user_id)
    .single()

  const gameWithProfile = {
    ...game,
    profiles: profile ?? undefined,
  }

  // プレイ数インクリメント（失敗しても続行）
  try { await supabase.rpc('increment_play_count', { game_id: params.id }) } catch {}

  return <GamePlayer game={gameWithProfile} />
}
