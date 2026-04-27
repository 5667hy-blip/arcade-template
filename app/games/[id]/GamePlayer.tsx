'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Game } from '@/lib/supabase/types'

export default function GamePlayer({ game, htmlContent }: { game: Game; htmlContent: string | null }) {
  const [fullscreen, setFullscreen] = useState(false)

  return (
    <div className={fullscreen ? 'fixed inset-0 z-50 bg-black flex flex-col' : 'max-w-4xl mx-auto px-4 py-6'}>
      {/* ゲームタイトルバー */}
      <div className={`flex items-center justify-between mb-3 ${fullscreen ? 'px-3 pt-3' : ''}`}>
        <div>
          {!fullscreen && (
            <Link href="/" className="text-gray-500 text-xs hover:text-arcade-cyan mb-1 block">
              ← 一覧に戻る
            </Link>
          )}
          <h1 className="text-white font-bold text-lg leading-tight">{game.title}</h1>
          {game.profiles?.username && (
            <p className="text-gray-500 text-xs">by @{game.profiles.username}</p>
          )}
        </div>
        <button
          onClick={() => setFullscreen(!fullscreen)}
          className="btn-secondary text-xs py-1.5 px-3 whitespace-nowrap"
          title={fullscreen ? '通常表示' : '全画面表示'}
        >
          {fullscreen ? '✕ 閉じる' : '⛶ 全画面'}
        </button>
      </div>

      {/* ゲームフレーム */}
      <div
        className={`
          relative bg-black border border-arcade-border rounded-lg overflow-hidden
          ${fullscreen ? 'flex-1' : 'w-full aspect-[4/3] md:aspect-video'}
        `}
      >
        <iframe
          {...(htmlContent ? { srcDoc: htmlContent } : { src: game.game_url })}
          className="absolute inset-0 w-full h-full"
          allow="fullscreen; autoplay; gamepad"
          sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-popups"
          title={game.title}
        />
      </div>

      {/* ゲーム情報 */}
      {!fullscreen && (
        <div className="mt-4 bg-arcade-card border border-arcade-border rounded-lg p-4">
          <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
            <span>▶ {game.play_count.toLocaleString()} プレイ</span>
            <span>
              {new Date(game.created_at).toLocaleDateString('ja-JP')} 登録
            </span>
          </div>
          {game.description && (
            <p className="text-gray-300 text-sm whitespace-pre-wrap">{game.description}</p>
          )}
          {game.tags && game.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {game.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/?tag=${encodeURIComponent(tag)}`}
                  className="text-xs bg-arcade-border text-gray-400 px-2 py-0.5 rounded
                             hover:bg-arcade-cyan/20 hover:text-arcade-cyan transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
