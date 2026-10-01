import { useEffect, useId, useRef, useState } from 'react'
import { getHeroBackground, readImageAsDataUrl, setHeroBackground } from '../lib/heroBackground'
import './HeroBackgroundControl.css'

type Props = {
  onChange?: (url: string | null) => void
}

function editorEnabled() {
  try {
    if (new URLSearchParams(window.location.search).get('edit') === '1') {
      localStorage.setItem('axonafrica-edit', '1')
      return true
    }
    return localStorage.getItem('axonafrica-edit') === '1'
  } catch {
    return false
  }
}

export function HeroBackgroundControl({ onChange }: Props) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [visible, setVisible] = useState(false)
  const [hasBg, setHasBg] = useState(Boolean(getHeroBackground()))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setVisible(editorEnabled())
    const sync = () => setHasBg(Boolean(getHeroBackground()))
    window.addEventListener('axonafrica:hero-bg', sync)
    return () => window.removeEventListener('axonafrica:hero-bg', sync)
  }, [])

  if (!visible) return null

  async function onFile(file: File | null) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const dataUrl = await readImageAsDataUrl(file)
      setHeroBackground(dataUrl)
      setHasBg(true)
      onChange?.(dataUrl)
    } catch {
      setError('Could not use that image. Try a smaller JPG or PNG.')
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function clear() {
    setHeroBackground(null)
    setHasBg(false)
    onChange?.(null)
    setError('')
  }

  return (
    <div className="bg-control">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
      />
      <label htmlFor={inputId} className="bg-control__btn">
        {busy ? 'Uploading…' : hasBg ? 'Change background' : 'Upload background'}
      </label>
      {hasBg && (
        <button type="button" className="bg-control__btn bg-control__btn--ghost" onClick={clear}>
          Remove
        </button>
      )}
      {error && <p className="bg-control__error">{error}</p>}
    </div>
  )
}
