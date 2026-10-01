import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Logo } from './Logo'
import './Header.css'

const links = [
  { to: '/about', label: 'About' },
  { to: '/program', label: 'Program' },
  { to: '/innovators', label: 'Innovators' },
  { to: '/get-involved', label: 'Get Involved' },
]

export function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

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
