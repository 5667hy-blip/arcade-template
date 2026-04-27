'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useRef } from 'react'

type UploadMode = 'file' | 'url'

export default function UploadPage() {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const thumbInputRef = useRef<HTMLInputElement>(null)

  const [mode, setMode] = useState<UploadMode>('url')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [gameUrl, setGameUrl] = useState('')
  const [gameFile, setGameFile] = useState<File | null>(null)
  const [thumbFile, setThumbFile] = useState<File | null>(null)
  const [thumbPreview, setThumbPreview] = useState<string | null>(null)
  const [tags, setTags] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState('')

  const handleThumbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setThumbFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setThumbPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }

    try {
      let finalGameUrl = gameUrl
      let htmlContent: string | null = null

      // HTMLファイルの場合：テキストとしてDBに保存（Storageは使わない）
      if (mode === 'file') {
        if (!gameFile) throw new Error('HTMLファイルを選択してください')
        setProgress('ゲームファイルを読み込み中...')
        htmlContent = await gameFile.text()
        finalGameUrl = `file:${gameFile.name}` // URLは使わないがNOT NULL制約のためダミー
      }

      // サムネイルアップロード
      let thumbnailUrl: string | null = null
      if (thumbFile) {
        setProgress('サムネイルをアップロード中...')
        const thumbPath = `${user.id}/${Date.now()}_${thumbFile.name}`
        const { error: thumbError, data: thumbData } = await supabase.storage
          .from('thumbnails')
          .upload(thumbPath, thumbFile)
        if (thumbError) throw thumbError
        const { data: thumbUrlData } = supabase.storage.from('thumbnails').getPublicUrl(thumbData.path)
        thumbnailUrl = thumbUrlData.publicUrl
      }

      // ゲーム情報をDBに保存
      setProgress('ゲーム情報を保存中...')
      const tagArray = tags.split(/[,、\s]+/).map(t => t.trim()).filter(Boolean)

      const { data: game, error: dbError } = await supabase
        .from('games')
        .insert({
          title,
          description: description || null,
          game_url: finalGameUrl,
          html_content: htmlContent,
          thumbnail_url: thumbnailUrl,
          user_id: user.id,
          tags: tagArray.length > 0 ? tagArray : null,
        })
        .select()
        .single()

      if (dbError) throw dbError
      router.push(`/games/${game.id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました')
    } finally {
      setLoading(false)
      setProgress('')
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="font-pixel text-arcade-green text-lg neon-text mb-8"
        style={{ textShadow: '0 0 10px #39ff14, 0 0 20px #39ff1440' }}>
        UPLOAD GAME
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-900/30 border border-red-500/50 text-red-400 px-4 py-3 rounded text-sm">
            {error}
          </div>
        )}

        {/* タイトル */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">
            ゲームタイトル <span className="text-arcade-pink">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
            placeholder="マイゲーム"
            required
          />
        </div>

        {/* アップロード方式 */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">ゲームの登録方法</label>
          <div className="flex gap-2">
            {(['url', 'file'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded text-sm border transition-all ${
                  mode === m
                    ? 'border-arcade-cyan text-arcade-cyan bg-arcade-cyan/10'
                    : 'border-arcade-border text-gray-400 hover:border-gray-500'
                }`}
              >
                {m === 'url' ? '🔗 URL指定' : '📁 HTMLファイル'}
              </button>
            ))}
          </div>
        </div>

        {/* URLまたはファイル */}
        {mode === 'url' ? (
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              ゲームURL <span className="text-arcade-pink">*</span>
            </label>
            <input
              type="url"
              value={gameUrl}
              onChange={(e) => setGameUrl(e.target.value)}
              className="input-field"
              placeholder="https://example.com/game/index.html"
              required={mode === 'url'}
            />
            <p className="text-xs text-gray-600 mt-1">
              iframe埋め込みに対応したURLを指定してください
            </p>
          </div>
        ) : (
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              HTMLファイル <span className="text-arcade-pink">*</span>
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-arcade-border hover:border-arcade-cyan
                         rounded-lg p-6 text-center cursor-pointer transition-colors"
            >
              {gameFile ? (
                <p className="text-arcade-cyan text-sm">{gameFile.name}</p>
              ) : (
                <>
                  <p className="text-gray-400 text-sm">クリックしてHTMLファイルを選択</p>
                  <p className="text-gray-600 text-xs mt-1">単一の .html ファイル</p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".html,text/html"
              onChange={(e) => setGameFile(e.target.files?.[0] || null)}
              className="hidden"
            />
          </div>
        )}

        {/* サムネイル */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">サムネイル画像（任意）</label>
          <div
            onClick={() => thumbInputRef.current?.click()}
            className="border-2 border-dashed border-arcade-border hover:border-arcade-cyan
                       rounded-lg p-4 text-center cursor-pointer transition-colors"
          >
            {thumbPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={thumbPreview} alt="preview" className="h-24 mx-auto object-contain rounded" />
            ) : (
              <p className="text-gray-500 text-sm">画像を選択（JPG / PNG）</p>
            )}
          </div>
          <input
            ref={thumbInputRef}
            type="file"
            accept="image/*"
            onChange={handleThumbChange}
            className="hidden"
          />
        </div>

        {/* 説明 */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">説明（任意）</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-field resize-none"
            rows={3}
            placeholder="ゲームの説明、操作方法など..."
          />
        </div>

        {/* タグ */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">タグ（任意）</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="input-field"
            placeholder="アクション、パズル、2人用（カンマ区切り）"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full disabled:opacity-50 py-3"
        >
          {loading ? progress || 'アップロード中...' : '🎮 ゲームを登録する'}
        </button>
      </form>
    </div>
  )
}
