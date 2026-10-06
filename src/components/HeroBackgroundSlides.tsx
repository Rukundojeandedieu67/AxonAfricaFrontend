import { useEffect, useRef, useState } from 'react'
import { api, unwrapList, type HeroSlide } from '../api/client'

/** Each hero photo stays fully visible for this long, then the next cuts in. */
export const HERO_BG_HOLD_MS = 4000

/** Always the first image on every hero section. */
export const HERO_FIRST_IMAGE = '/6.jpeg'

export type HeroBgStatus = 'loading' | 'ready' | 'empty'

type Props = {
  /** `home` uses landing hero classes; `page` uses inner page-hero classes. */
  variant?: 'home' | 'page'
  onStatusChange?: (status: HeroBgStatus) => void
}

type ReadySlide = {
  id: string | number
  src: string
}

/**
 * Cloudinary raw URLs often fail in <img> when the browser sends a site Referer.
 * Load with referrerPolicy=no-referrer so photos actually paint on axonafrica.org.
 */
function preloadImage(src: string) {
  return new Promise<boolean>((resolve) => {
    const img = new Image()
    img.referrerPolicy = 'no-referrer'
    img.onload = () => resolve(img.naturalWidth > 0)
    img.onerror = () => resolve(false)
    img.src = src
  })
}

export function HeroBackgroundSlides({ variant = 'page', onStatusChange }: Props) {
  const [slides, setSlides] = useState<ReadySlide[]>([])
  const [activeSlide, setActiveSlide] = useState(0)
  const [status, setStatus] = useState<HeroBgStatus>('loading')
  const anchorRef = useRef<HTMLSpanElement>(null)
  const onStatusChangeRef = useRef(onStatusChange)
  onStatusChangeRef.current = onStatusChange

  useEffect(() => {
    onStatusChangeRef.current?.(status)
    const parent = anchorRef.current?.closest('.page-hero, .hero') as HTMLElement | null
    if (parent) parent.dataset.heroBg = status
  }, [status])

  useEffect(() => {
    let active = true

    ;(async () => {
      const usable: ReadySlide[] = []

      // Local first image — appears first on every hero.
      if (await preloadImage(HERO_FIRST_IMAGE)) {
        if (!active) return
        usable.push({ id: 'local-first', src: HERO_FIRST_IMAGE })
        setSlides([...usable])
        setActiveSlide(0)
        setStatus('ready')
      }

      try {
        const data = await api.heroSlides()
        if (!active) return
        const listed = unwrapList(data)
          .filter((slide: HeroSlide) => slide.image)
          .slice()
          .sort((a, b) => a.order - b.order)

        for (const slide of listed) {
          const ok = await preloadImage(slide.image)
          if (!active) return
          if (!ok) continue
          usable.push({ id: slide.id, src: slide.image })
          if (usable.length === 1) {
            setSlides([...usable])
            setActiveSlide(0)
            setStatus('ready')
          } else {
            setSlides([...usable])
          }
        }
      } catch {
        /* API optional when local first image already works */
      }

      if (!active) return
      if (!usable.length) {
        setSlides([])
        setStatus('empty')
      }
    })()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (status !== 'ready' || slides.length < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    // Hard cut every 4s — not a slideshow crossfade.
    const timer = window.setInterval(() => {
      setActiveSlide((index) => (index + 1) % slides.length)
    }, HERO_BG_HOLD_MS)

    return () => window.clearInterval(timer)
  }, [status, slides.length])

  const rootClass = variant === 'home' ? 'hero__bg' : 'page-hero__slides'
  const slideClass = variant === 'home' ? 'hero__bg-image' : 'page-hero__slide'

  return (
    <>
      <span ref={anchorRef} hidden aria-hidden="true" />
      {status === 'ready' && slides.length > 0 && (
        <div className={rootClass} aria-hidden="true">
          {slides.map((slide, index) => (
            <img
              key={slide.id}
              className={`${slideClass} ${index === activeSlide ? 'is-active' : ''}`}
              src={slide.src}
              alt=""
              referrerPolicy="no-referrer"
              loading={index === 0 ? 'eager' : 'lazy'}
              decoding="async"
              fetchPriority={index === 0 ? 'high' : 'low'}
            />
          ))}
        </div>
      )}
    </>
  )
}
