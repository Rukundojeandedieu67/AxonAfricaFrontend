import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Scroll to top and briefly animate page enter on route change. */
export function PageMotion({ children }: { children: React.ReactNode }) {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
    const main = document.getElementById('main')
    if (!main) return
    main.classList.remove('page-enter')
    void main.offsetWidth
    main.classList.add('page-enter')
  }, [location.pathname])

  return children
}
