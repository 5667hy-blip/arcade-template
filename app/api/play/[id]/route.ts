import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: game } = await supabase
    .from('games')
    .select('game_url')
    .eq('id', params.id)
    .single()

  if (!game) {
    return new NextResponse('Game not found', { status: 404 })
  }

  // game_urlがHTMLコンテンツ（<で始まる）ならそのまま返す
  if (game.game_url.trimStart().startsWith('<')) {
    return new NextResponse(game.game_url, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  // URLの場合はリダイレクト
  return NextResponse.redirect(game.game_url)
}
