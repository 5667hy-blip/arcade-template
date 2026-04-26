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

  // Supabase StorageのHTMLをバイト列で取得し、UTF-8として強制デコード
  const res = await fetch(game.game_url)
  if (!res.ok) {
    return new NextResponse('Failed to fetch game', { status: 502 })
  }

  const buffer = await res.arrayBuffer()
  const html = new TextDecoder('utf-8').decode(buffer)

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  })
}
