import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: game } = await supabase
    .from('games')
    .select('game_url')
    .eq('id', params.id)
    .single()

  if (!game) return new NextResponse('Not found', { status: 404 })

  const url = game.game_url

  // HTMLが直接入っている場合
  if (url.trimStart().startsWith('<')) {
    return new NextResponse(url, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  // Supabase StorageのURLの場合：パスを取り出してSDK経由でダウンロード
  if (url.includes('/storage/v1/object/public/games/')) {
    const storagePath = url.split('/storage/v1/object/public/games/')[1]
    const { data, error } = await supabase.storage.from('games').download(storagePath)
    if (error || !data) {
      return new NextResponse('Failed to load game: ' + error?.message, { status: 502 })
    }
    const buffer = await data.arrayBuffer()
    const html = new TextDecoder('utf-8').decode(buffer)
    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  // 外部URLの場合はリダイレクト
  return NextResponse.redirect(url)
}
