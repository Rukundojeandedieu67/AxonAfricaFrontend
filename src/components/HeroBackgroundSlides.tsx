import { useEffect, useRef, useState } from 'react'
import { api, unwrapList, type HeroSlide } from '../api/client'

/** Crossfade length = swap cadence so images keep moving with no hold/delay. */
export const HERO_BG_CROSSFADE_MS = 2400

type Props = {
  /** `home` uses landing hero classes; `page` uses inner page-hero classes. */
  variant?: 'home' | 'page'
  onSlidesChange?: (slides: HeroSlide[]) => void
}

export function HeroBackgroundSlides({ variant = 'page', onSlidesChange }: Props) {
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [activeSlide, setActiveSlide] = useState(0)
  const onSlidesChangeRef = useRef(onSlidesChange)
  onSlidesChangeRef.current = onSlidesChange

  useEffect(() => {
    let active = true
    api
      .heroSlides()
      .then((data) => {
        if (!active) return
        const next = unwrapList(data)
          .filter((slide) => slide.image)
          .slice()
          .sort((a, b) => a.order - b.order)
        setSlides(next)
        onSlidesChangeRef.current?.(next)
      })
      .catch(() => {
        if (!active) return
        setSlides([])
        onSlidesChangeRef.current?.([])
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (slides.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }
    // Advance as soon as the crossfade finishes — no idle delay between images.
    const timer = window.setInterval(() => {
      setActiveSlide((index) => (index + 1) % slides.length)
    }, HERO_BG_CROSSFADE_MS)
    return () => window.clearInterval(timer)
  }, [slides.length])

  // Preload so the next background never waits on network.
  useEffect(() => {
    slides.forEach((slide) => {
      const img = new Image()
      img.src = slide.image
    })
  }, [slides])

  if (!slides.length) return null

  const rootClass = variant === 'home' ? 'hero__bg' : 'page-hero__slides'
  const slideClass = variant === 'home' ? 'hero__bg-image' : 'page-hero__slide'

  return (
    <div
      className={rootClass}
      aria-hidden="true"
      style={{ ['--hero-bg-crossfade' as string]: `${HERO_BG_CROSSFADE_MS}ms` }}
    >
      {slides.map((slide, index) => (
        <img
          key={slide.id}
          className={`${slideClass} ${index === activeSlide ? 'is-active' : ''}`}
          src={slide.image}
          alt=""
          loading="eager"
          decoding="async"
          fetchPriority={index === 0 ? 'high' : 'low'}
        />
      ))}
    </div>
  )
}
