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

  // Supabase Storage以外のURLはそのままリダイレクト
  if (!game.game_url.includes('supabase.co/storage')) {
    return NextResponse.redirect(game.game_url)
  }

  // Supabase StorageのHTMLをフェッチして正しいContent-Typeで返す
  const res = await fetch(game.game_url)
  if (!res.ok) {
    return new NextResponse('Failed to fetch game', { status: 502 })
  }

  const html = await res.text()

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Frame-Options': 'SAMEORIGIN',
    },
  })
}
