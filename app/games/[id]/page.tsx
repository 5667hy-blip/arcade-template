import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Game } from '@/lib/supabase/types'
import GamePlayer from './GamePlayer'

export default async function GamePage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: game, error } = await supabase
    .from('games')
    .select('*, html_content')
    .eq('id', params.id)
    .single<Game & { html_content: string | null }>()

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

  const gameWithProfile = {
    ...game,
    profiles: profile ?? undefined,
  }

  try { await supabase.rpc('increment_play_count', { game_id: params.id }) } catch {}

  return <GamePlayer game={gameWithProfile} htmlContent={game.html_content ?? null} />
}
