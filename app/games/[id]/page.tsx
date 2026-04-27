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

  if (error || !game) notFound()

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', game.user_id)
    .single()

  try { await supabase.rpc('increment_play_count', { game_id: params.id }) } catch {}

  return <GamePlayer game={{ ...game, profiles: profile ?? undefined }} />
}
