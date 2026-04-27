import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Game } from '@/lib/supabase/types'
import GamePlayer from './GamePlayer'

export default async function GamePage({ params }: { params: { id: string } }) {
  const supabase = createClient()

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

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', game.user_id)
    .single()

  // Supabase StorageのURLならHTMLを直接取得してsrcdocで渡す（文字化け対策）
  let htmlContent: string | null = null
  if (game.game_url.includes('supabase.co/storage')) {
    const res = await fetch(game.game_url)
    if (res.ok) {
      const buffer = await res.arrayBuffer()
      htmlContent = new TextDecoder('utf-8').decode(buffer)
    }
  }

  const gameWithProfile = {
    ...game,
    profiles: profile ?? undefined,
  }

  try { await supabase.rpc('increment_play_count', { game_id: params.id }) } catch {}

  return <GamePlayer game={gameWithProfile} htmlContent={htmlContent} />
}
