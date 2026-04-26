import Link from 'next/link'
import Image from 'next/image'
import type { Game } from '@/lib/supabase/types'

export default function GameCard({ game }: { game: Game }) {
  return (
    <Link href={`/games/${game.id}`} className="block group">
      <div className="bg-arcade-card border border-arcade-border rounded-lg overflow-hidden card-hover">
        {/* サムネイル */}
        <div className="aspect-square relative bg-arcade-bg">
          {game.thumbnail_url ? (
            <Image
              src={game.thumbnail_url}
              alt={game.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-4xl text-gray-700">
              🎮
            </div>
          )}
          {/* プレイ数バッジ */}
          <div className="absolute bottom-1 right-1 bg-black/70 text-arcade-cyan text-xs px-1.5 py-0.5 rounded">
            ▶ {game.play_count.toLocaleString()}
          </div>
        </div>

        {/* タイトル */}
        <div className="p-2">
          <p className="text-white text-xs font-semibold truncate group-hover:text-arcade-cyan transition-colors">
            {game.title}
          </p>
          {game.profiles?.username && (
            <p className="text-gray-500 text-xs truncate mt-0.5">
              @{game.profiles.username}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
