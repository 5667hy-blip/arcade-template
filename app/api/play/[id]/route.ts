import { createClient } from '@/lib/supabase/server'

const HTML_HEADERS = {
  'Content-Type': 'text/html; charset=utf-8',
  'X-Content-Type-Options': 'nosniff',
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: game } = await supabase
    .from('games')
    .select('game_url')
    .eq('id', params.id)
    .single()

  if (!game) return new Response('Not found', { status: 404 })

  const url = game.game_url

  // HTMLが直接入っている場合
  if (url.trimStart().startsWith('<')) {
    return new Response(url, { headers: HTML_HEADERS })
  }

  // Supabase StorageのURL
  if (url.includes('/storage/v1/object/public/games/')) {
    const storagePath = url.split('/storage/v1/object/public/games/')[1]
    const { data, error } = await supabase.storage.from('games').download(storagePath)
    if (error || !data) {
      return new Response('Failed: ' + error?.message, { status: 502 })
    }
    const buffer = await data.arrayBuffer()
    const html = new TextDecoder('utf-8').decode(buffer)
    return new Response(html, { headers: HTML_HEADERS })
  }

  // 外部URL
  return Response.redirect(url)
}
