import { useEffect, useLayoutEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Logo } from './Logo'
import './Header.css'

const links = [
  { to: '/about', label: 'About' },
  { to: '/program', label: 'Program' },
  { to: '/innovators', label: 'Innovators' },
  { to: '/get-involved', label: 'Get Involved' },
  { to: '/explore', label: 'Explore' },
  { to: '/account', label: 'Account' },
]

type Theme = 'day' | 'night'
const THEME_KEY = 'axonafrica-theme'

function getInitialTheme(): Theme {
  const savedTheme = localStorage.getItem(THEME_KEY)
  if (savedTheme === 'day' || savedTheme === 'night') return savedTheme
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day'
}

export function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme === 'night' ? 'dark' : 'light'
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  return (
    <header className={`site-header ${scrolled ? 'site-header--scrolled' : ''}`}>
      <div className="container site-header__inner">
        <Logo />
        <nav className="site-header__nav" aria-label="Primary">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className="site-header__link">
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="site-header__actions">
          <button
            type="button"
            className="site-header__theme"
            aria-label={theme === 'night' ? 'Switch to day mode' : 'Switch to night mode'}
            aria-pressed={theme === 'night'}
            title={theme === 'night' ? 'Switch to day mode' : 'Switch to night mode'}
            onClick={() => setTheme((current) => (current === 'night' ? 'day' : 'night'))}
          >
            <span aria-hidden="true">{theme === 'night' ? '☀' : '☾'}</span>
          </button>
          <Link to="/apply" className="btn btn--gold site-header__apply">
            Apply Now
          </Link>
          <button
            type="button"
            className="site-header__menu"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
            <span aria-hidden>{open ? '✕' : '☰'}</span>
          </button>
        </div>
      </div>

      <div id="mobile-nav" className={`mobile-nav ${open ? 'is-open' : ''}`}>
        <nav aria-label="Mobile">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} onClick={() => setOpen(false)}>
              {link.label}
            </NavLink>
          ))}
          <Link to="/apply" className="btn btn--gold btn--full" onClick={() => setOpen(false)}>
            Apply Now
          </Link>
        </nav>
      </div>
    </header>
  )
}
