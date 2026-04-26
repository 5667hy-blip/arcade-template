export type Game = {
  id: string
  created_at: string
  title: string
  description: string | null
  thumbnail_url: string | null
  game_url: string
  user_id: string
  play_count: number
  tags: string[] | null
  profiles?: { username: string | null }
}
