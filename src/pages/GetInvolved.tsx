import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ApiError, api } from '../api/client'
import { Reveal } from '../components/Reveal'

type Mode = 'fund' | 'partner' | 'volunteer'

export function GetInvolvedPage() {
  const [mode, setMode] = useState<Mode>('fund')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    contact_name: '',
    full_name: '',
    email: '',
    organization: '',
    institution_name: '',
    message: '',
    expertise: '',
  })

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('')
    setError('')
    try {
      if (mode === 'fund') {
        await api.fundCohort({
          organization: form.organization || 'Individual',
          contact_name: form.contact_name,
          email: form.email,
          amount_range: 'To discuss',
          message: form.message,
        })
      } else if (mode === 'partner') {
        await api.partnerRequest({
          institution_name: form.institution_name || form.organization,
          institution_type: 'institution',
          contact_name: form.contact_name,
          email: form.email,
          offer: 'other',
          message: form.message,
        })
      } else {
        await api.volunteerRequest({
          kind: 'mentor',
          full_name: form.full_name || form.contact_name,
          email: form.email,
          organization: form.organization,
          expertise: form.expertise || 'General support',
          message: form.message,
        })
      }
      setStatus('Thank you — we received your message and will follow up by email.')
      setForm({
        contact_name: '',
        full_name: '',
        email: '',
        organization: '',
        institution_name: '',
        message: '',
        expertise: '',
      })
    } catch (err) {
      setError(
        err instanceof ApiError
          ? 'Could not send right now. Please try again or email the team.'
          : 'Network error. Please try again later.',
      )
    }
  }

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow eyebrow--on-dark">Get Involved</p>
          <h1>Find your place in the work.</h1>
          <p>Fund a cohort, open an institutional door, mentor, or apply as an innovator.</p>
        </div>
      </section>

      <section className="section">
        <div className="container grid-3">
          <Reveal>
            <article className="card" id="fund">
              <h3 style={{ color: 'var(--deep-green)' }}>Funders</h3>
              <p>
                Fund a cohort. Back the seed capital and mentorship that carries innovators through
                the program.
              </p>
              <button type="button" className="btn btn--gold" onClick={() => setMode('fund')}>
                Talk to us about funding
              </button>
            </article>
          </Reveal>
          <Reveal>
            <article className="card" id="partner">
              <h3 style={{ color: 'var(--deep-green)' }}>Institutions</h3>
              <p>
                Open a lab, a clinical validation site, or a placement so a finished solution can be
                tested where it matters.
              </p>
              <button type="button" className="btn btn--gold" onClick={() => setMode('partner')}>
                Become a partner
              </button>
            </article>
          </Reveal>
          <Reveal>
            <article className="card">
              <h3 style={{ color: 'var(--deep-green)' }}>Innovators</h3>
              <p>Bring your idea and start at Seed.</p>
              <Link to="/apply" className="btn btn--gold">
                Apply to Cohort 1
              </Link>
            </article>
          </Reveal>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--off-white)' }}>
        <div className="container" style={{ maxWidth: 640 }}>
          <Reveal>
            <p className="eyebrow eyebrow--leaf">Write to us</p>
            <h2 className="section-title">
              {mode === 'fund'
                ? 'Funding inquiry'
                : mode === 'partner'
                  ? 'Partnership inquiry'
                  : 'Volunteer / mentor inquiry'}
            </h2>
          </Reveal>
          <form className="card form-stack" onSubmit={onSubmit} style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {(['fund', 'partner', 'volunteer'] as Mode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`btn ${mode === m ? 'btn--green' : 'btn--outline-dark'}`}
                  onClick={() => setMode(m)}
                >
                  {m === 'fund' ? 'Fund' : m === 'partner' ? 'Partner' : 'Volunteer'}
                </button>
              ))}
            </div>
            <label>
              Full name
              <input
                required
                value={form.contact_name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    contact_name: e.target.value,
                    full_name: e.target.value,
                  })
                }
              />
            </label>
            <label>
              Email
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </label>
            <label>
              {mode === 'partner' ? 'Institution' : 'Organization'}
              <input
                value={mode === 'partner' ? form.institution_name : form.organization}
                onChange={(e) =>
                  setForm({
                    ...form,
                    organization: e.target.value,
                    institution_name: e.target.value,
                  })
                }
              />
            </label>
            {mode === 'volunteer' && (
              <label>
                Expertise
                <input
                  value={form.expertise}
                  onChange={(e) => setForm({ ...form, expertise: e.target.value })}
                />
              </label>
            )}
            <label>
              Message
              <textarea
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </label>
            {status && <p className="form-ok">{status}</p>}
            {error && <p className="form-error">{error}</p>}
            <button type="submit" className="btn btn--gold">
              Send message
            </button>
          </form>
        </div>
      </section>
    </>
  )
}
