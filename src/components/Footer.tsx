import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from './Logo'
import './Footer.css'

export function Footer() {
  const [email, setEmail] = useState('')
  const [note, setNote] = useState('')

  function onSubscribe(e: FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setNote('Thanks — we will send cohort announcements to this address.')
    setEmail('')
  }

  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div className="site-footer__brand">
          <Logo onDark size="lg" />
          <p>Empowering the next generation of health leaders in the digital age.</p>
        </div>

        <div>
          <h2>Organization</h2>
          <ul>
            <li>
              <Link to="/about">About &amp; Team</Link>
            </li>
            <li>
              <Link to="/get-involved">Get Involved</Link>
            </li>
            <li>
              <Link to="/stories">Stories &amp; Contact</Link>
            </li>
          </ul>
        </div>

        <div>
          <h2>Program</h2>
          <ul>
            <li>
              <Link to="/program">Digital Health Leaders</Link>
            </li>
            <li>
              <Link to="/apply">Apply to Cohort 1</Link>
            </li>
            <li>
              <Link to="/innovators">Innovators</Link>
            </li>
          </ul>
        </div>

        <form className="site-footer__news" onSubmit={onSubscribe}>
          <h2>Newsletter</h2>
          <p>Get the next cohort announcement first.</p>
          <label className="sr-only" htmlFor="newsletter-email">
            Email
          </label>
          <div className="site-footer__news-row">
            <input
              id="newsletter-email"
              type="email"
              required
              placeholder="you@example.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" className="btn btn--gold">
              Join
            </button>
          </div>
          {note && <p className="site-footer__note">{note}</p>}
        </form>
      </div>
      <div className="container site-footer__copy">
        <p>© {new Date().getFullYear()} AxonAfrica. All rights reserved.</p>
      </div>
    </footer>
  )
}
