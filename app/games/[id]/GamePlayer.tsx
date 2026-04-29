'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import type { Game } from '@/lib/supabase/types'

type NippleCollection = { on(evt: string, cb: (e: { data?: { angle?: { degree: number } } }) => void): void; destroy(): void }

function dispatchKey(iframeEl: HTMLIFrameElement, key: string, type: 'keydown' | 'keyup') {
  const doc = iframeEl.contentDocument
  if (!doc) return
  const code = key.length === 1 ? 'Key' + key.toUpperCase() : key
  doc.dispatchEvent(new KeyboardEvent(type, { key, code, bubbles: true, cancelable: true }))
}

const ALL_WASD = ['w', 'a', 's', 'd']

export default function GamePlayer({ game }: { game: Game & { profiles?: { username: string | null } | undefined } }) {
  const [fullscreen, setFullscreen] = useState(false)
  const [joystickEnabled, setJoystickEnabled] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const joystickZoneRef = useRef<HTMLDivElement>(null)
  const managerRef = useRef<NippleCollection | null>(null)

  useEffect(() => {
    if (!joystickEnabled) return

    let manager: NippleCollection | null = null
    const pressed = new Set<string>()

    const press = (iframe: HTMLIFrameElement, key: string) => {
      if (pressed.has(key)) return
      pressed.add(key)
      dispatchKey(iframe, key, 'keydown')
    }
    const release = (iframe: HTMLIFrameElement, key: string) => {
      if (!pressed.has(key)) return
      pressed.delete(key)
      dispatchKey(iframe, key, 'keyup')
    }
    const releaseAll = (iframe: HTMLIFrameElement) => {
      ALL_WASD.forEach((k) => release(iframe, k))
    }

    const init = async () => {
      const { create } = await import('nipplejs')
      const zone = joystickZoneRef.current
      if (!zone) return

      manager = create({
        zone,
        mode: 'static',
        position: { left: '50%', top: '50%' },
        color: 'white',
        size: 90,
        restOpacity: 0.5,
      })
      managerRef.current = manager

      manager.on('move', (evt) => {
        const iframe = iframeRef.current
        if (!iframe) return

        const deg = evt.data?.angle?.degree
        if (deg == null) { releaseAll(iframe); return }

        // nipplejs: 0°=右, 90°=上, 180°=左, 270°=下 (反時計回り)
        const d = ((deg % 360) + 360) % 360

        // 各方向を90°幅で検出、隣り合う方向と45°重複 → 8方向対応
        if (d > 22.5 && d < 157.5)  press(iframe, 'w'); else release(iframe, 'w')
        if (d > 202.5 && d < 337.5) press(iframe, 's'); else release(iframe, 's')
        if (d > 112.5 && d < 247.5) press(iframe, 'a'); else release(iframe, 'a')
        if (d > 292.5 || d < 67.5)  press(iframe, 'd'); else release(iframe, 'd')
      })

      manager.on('end', () => {
        const iframe = iframeRef.current
        if (iframe) releaseAll(iframe)
      })
    }

    init()

    return () => {
      manager?.destroy()
      managerRef.current = null
      pressed.clear()
    }
  }, [joystickEnabled])

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col">
        <div className="flex items-center justify-between px-3 pt-3 pb-2 shrink-0">
          <span className="text-white font-bold text-sm truncate max-w-[60vw]">{game.title}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setJoystickEnabled((v) => !v)}
              className="btn-secondary text-xs py-1 px-2"
            >
              {joystickEnabled ? '🕹ON' : '🕹OFF'}
            </button>
            <button onClick={() => setFullscreen(false)} className="btn-secondary text-xs py-1 px-2">
              ✕ 閉じる
            </button>
          </div>
        </div>
        <div className="relative flex-1 bg-black">
          <iframe
            ref={iframeRef}
            src={`/api/play/${game.id}`}
            className="absolute inset-0 w-full h-full z-0"
            allow="fullscreen; autoplay; gamepad"
            sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-popups"
            title={game.title}
          />
          {joystickEnabled && (
            <div
              ref={joystickZoneRef}
              className="absolute bottom-6 left-6 w-28 h-28 z-10"
              style={{ touchAction: 'none' }}
            />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen md:min-h-0 md:max-w-4xl md:mx-auto md:px-4 md:py-6">

      {/* ヘッダー */}
      <div className="flex items-center justify-between px-3 py-2 md:px-0 md:py-0 md:mb-3 border-b border-arcade-border md:border-none shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Link href="/" className="text-gray-400 text-xs shrink-0 hover:text-arcade-cyan">
            ← <span className="hidden md:inline">一覧に戻る</span><span className="md:hidden">戻る</span>
          </Link>
          <div className="min-w-0">
            <h1 className="text-white font-bold text-sm md:text-lg leading-tight truncate">{game.title}</h1>
            {game.profiles?.username && (
              <p className="text-gray-500 text-xs hidden md:block">by @{game.profiles.username}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          <button
            onClick={() => setJoystickEnabled((v) => !v)}
            className="btn-secondary text-xs py-1 px-2"
          >
            {joystickEnabled ? '🕹ON' : '🕹OFF'}
          </button>
          <button
            onClick={() => setFullscreen(true)}
            className="btn-secondary text-xs py-1 px-2 md:py-1.5 md:px-3"
          >
            ⛶<span className="hidden md:inline"> 全画面</span>
          </button>
        </div>
      </div>

      {/* ゲームエリア */}
      {/* モバイル: 画面幅フル、高さはvwで確保 / PC: アスペクト比固定 */}
      <div
        className="relative w-full bg-black md:border md:border-arcade-border md:rounded-lg md:overflow-hidden md:aspect-video shrink-0"
        style={{ height: 'min(56.25vw, 80vh)' }}
      >
        <iframe
          ref={iframeRef}
          src={`/api/play/${game.id}`}
          className="absolute inset-0 w-full h-full z-0"
          allow="fullscreen; autoplay; gamepad"
          sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-popups"
          title={game.title}
        />
        {joystickEnabled && (
          <div
            ref={joystickZoneRef}
            className="absolute bottom-4 left-4 w-28 h-28 z-10"
            style={{ touchAction: 'none' }}
          />
        )}
      </div>

      {/* ゲーム情報 */}
      <div className="px-4 py-3 md:mt-4 md:bg-arcade-card md:border md:border-arcade-border md:rounded-lg md:p-4">
        {game.profiles?.username && (
          <p className="text-gray-500 text-xs mb-1 md:hidden">by @{game.profiles.username}</p>
        )}
        <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm text-gray-400 mb-2 md:mb-3">
          <span>▶ {game.play_count.toLocaleString()} プレイ</span>
          <span>{new Date(game.created_at).toLocaleDateString('ja-JP')} 登録</span>
        </div>
        {game.description && (
          <p className="text-gray-300 text-sm whitespace-pre-wrap">{game.description}</p>
        )}
        {game.tags && game.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2 md:mt-3">
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
    </div>
  )
}
