import { useEffect, useState } from 'react'
import { api, unwrapList, type HeroSlide } from '../api/client'

export function HeroBackgroundSlides() {
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    let active = true
    api
      .heroSlides()
      .then((data) => {
        if (active) setSlides(unwrapList(data).filter((slide) => slide.image))
      })
      .catch(() => {
        if (active) setSlides([])
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (slides.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }
    const timer = window.setInterval(() => {
      setActiveSlide((index) => (index + 1) % slides.length)
    }, 6000)
    return () => window.clearInterval(timer)
  }, [slides.length])

  if (!slides.length) return null

  return (
    <div className="page-hero__slides" aria-hidden="true">
      {slides.map((slide, index) => (
        <img
          key={slide.id}
          className={`page-hero__slide ${index === activeSlide ? 'is-active' : ''}`}
          src={slide.image}
          alt=""
          loading={index === 0 ? 'eager' : 'lazy'}
          fetchPriority={index === 0 ? 'high' : 'auto'}
        />
      ))}
    </div>
  )
}
