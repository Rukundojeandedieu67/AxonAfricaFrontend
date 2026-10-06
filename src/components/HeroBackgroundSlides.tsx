import { useEffect, useRef, useState } from 'react'
import { api, unwrapList, type HeroSlide } from '../api/client'

/** Crossfade length = swap cadence so images keep moving with no hold/delay. */
export const HERO_BG_CROSSFADE_MS = 2400

export type HeroBgStatus = 'loading' | 'ready' | 'empty'

type Props = {
  /** `home` uses landing hero classes; `page` uses inner page-hero classes. */
  variant?: 'home' | 'page'
  onStatusChange?: (status: HeroBgStatus) => void
}

type ReadySlide = HeroSlide & { src: string }

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
  const [cycling, setCycling] = useState(false)
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
      try {
        const data = await api.heroSlides()
        if (!active) return
        const listed = unwrapList(data)
          .filter((slide) => slide.image)
          .slice()
          .sort((a, b) => a.order - b.order)

        if (!listed.length) {
          setSlides([])
          setStatus('empty')
          return
        }

        const usable: ReadySlide[] = []
        for (const slide of listed) {
          const ok = await preloadImage(slide.image)
          if (!active) return
          if (!ok) continue
          usable.push({ ...slide, src: slide.image })
          // Reveal as soon as the first real photo is ready — no green flash.
          if (usable.length === 1) {
            setSlides([...usable])
            setActiveSlide(0)
            setStatus('ready')
          } else {
            setSlides([...usable])
          }
        }

        if (!usable.length) {
          setSlides([])
          setStatus('empty')
        }
      } catch {
        if (!active) return
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

    const enable = window.setTimeout(() => setCycling(true), 40)
    const timer = window.setInterval(() => {
      setActiveSlide((index) => (index + 1) % slides.length)
    }, HERO_BG_CROSSFADE_MS)

    return () => {
      window.clearTimeout(enable)
      window.clearInterval(timer)
    }
  }, [status, slides.length])

  const rootClass = variant === 'home' ? 'hero__bg' : 'page-hero__slides'
  const slideClass = variant === 'home' ? 'hero__bg-image' : 'page-hero__slide'

  return (
    <>
      <span ref={anchorRef} hidden aria-hidden="true" />
      {status === 'ready' && slides.length > 0 && (
        <div
          className={`${rootClass}${cycling ? ' is-cycling' : ''}`}
          aria-hidden="true"
          style={{ ['--hero-bg-crossfade' as string]: `${HERO_BG_CROSSFADE_MS}ms` }}
        >
          {slides.map((slide, index) => (
            <img
              key={slide.id}
              className={`${slideClass} ${index === activeSlide ? 'is-active' : ''}`}
              src={slide.src}
              alt=""
              referrerPolicy="no-referrer"
              loading="eager"
              decoding="async"
              fetchPriority={index === 0 ? 'high' : 'low'}
            />
          ))}
        </div>
      )}
    </>
  )
}
