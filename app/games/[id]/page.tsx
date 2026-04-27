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

  const gameWithProfile = { ...game, profiles: profile ?? undefined }

  try { await supabase.rpc('increment_play_count', { game_id: params.id }) } catch {}

  // game_urlが"<"で始まる場合はHTMLコンテンツが直接入っている
  const htmlContent = game.game_url.trimStart().startsWith('<')
    ? game.game_url
    : null

  return <GamePlayer game={gameWithProfile} htmlContent={htmlContent} />
}
