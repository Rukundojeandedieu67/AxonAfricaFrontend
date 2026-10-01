const BG_KEY = 'axonafrica-hero-bg'

export function getHeroBackground(): string | null {
  try {
    return localStorage.getItem(BG_KEY)
  } catch {
    return null
  }
}

export function setHeroBackground(dataUrl: string | null) {
  try {
    if (!dataUrl) localStorage.removeItem(BG_KEY)
    else localStorage.setItem(BG_KEY, dataUrl)
  } catch {
    /* quota / private mode */
  }
  window.dispatchEvent(new CustomEvent('axonafrica:hero-bg', { detail: dataUrl }))
}

export function readImageAsDataUrl(file: File, maxWidth = 1920, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read image'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Invalid image'))
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width)
        const w = Math.round(img.width * scale)
        const h = Math.round(img.height * scale)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(String(reader.result))
          return
        }
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  })
}
