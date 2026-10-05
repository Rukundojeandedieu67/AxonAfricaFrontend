import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ApiError, api } from '../api/client'
import { HeroBackgroundSlides } from '../components/HeroBackgroundSlides'
import { Reveal } from '../components/Reveal'

type Mode = 'fund' | 'partner' | 'volunteer'
type VolunteerKind = 'mentor' | 'judge' | 'ambassador' | 'exhibitor'

export function GetInvolvedPage() {
  const [mode, setMode] = useState<Mode>('fund')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState<{
    contact_name: string
    full_name: string
    email: string
    organization: string
    institution_name: string
    institution_type: string
    offer: string
    amount_range: string
    phone: string
    kind: VolunteerKind
    faculty: string
    message: string
    expertise: string
  }>({
    contact_name: '',
    full_name: '',
    email: '',
    organization: '',
    institution_name: '',
    institution_type: '',
    offer: 'other',
    amount_range: '',
    phone: '',
    kind: 'mentor',
    faculty: '',
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
          organization: form.organization,
          contact_name: form.contact_name,
          email: form.email,
          phone: form.phone,
          amount_range: form.amount_range,
          message: form.message,
        })
      } else if (mode === 'partner') {
        await api.partnerRequest({
          institution_name: form.institution_name,
          institution_type: form.institution_type,
          contact_name: form.contact_name,
          email: form.email,
          offer: form.offer,
          message: form.message,
        })
      } else {
        await api.volunteerRequest({
          kind: form.kind,
          full_name: form.full_name,
          email: form.email,
          phone: form.phone,
          organization: form.organization,
          expertise: form.expertise,
          faculty: form.faculty,
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
        institution_type: '',
        offer: 'other',
        amount_range: '',
        phone: '',
        kind: 'mentor',
        faculty: '',
        message: '',
        expertise: '',
      })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Network error. Please try again later.')
    }
  }

  return (
    <>
      <section className="page-hero">
        <HeroBackgroundSlides />
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
              <h3 style={{ color: 'var(--heading-color)' }}>Funders</h3>
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
              <h3 style={{ color: 'var(--heading-color)' }}>Institutions</h3>
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
              <h3 style={{ color: 'var(--heading-color)' }}>Innovators</h3>
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
                required={mode === 'partner' || mode === 'fund'}
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
            {mode === 'fund' && (
              <>
                <label>
                  Phone (optional)
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </label>
                <label>
                  Funding amount or range
                  <input
                    required
                    value={form.amount_range}
                    onChange={(e) => setForm({ ...form, amount_range: e.target.value })}
                  />
                </label>
              </>
            )}
            {mode === 'partner' && (
              <>
                <label>
                  Institution type
                  <select
                    required
                    value={form.institution_type}
                    onChange={(e) => setForm({ ...form, institution_type: e.target.value })}
                  >
                    <option value="" disabled>
                      Select type
                    </option>
                    <option value="hospital">Hospital</option>
                    <option value="ministry">Ministry</option>
                    <option value="university">University</option>
                    <option value="funder">Funder</option>
                    <option value="tech">Technology</option>
                    <option value="ngo">NGO</option>
                  </select>
                </label>
                <label>
                  Partnership offer
                  <select
                    value={form.offer}
                    onChange={(e) => setForm({ ...form, offer: e.target.value })}
                  >
                    <option value="lab">Lab</option>
                    <option value="clinical_validation_site">Clinical validation site</option>
                    <option value="placement">Placement</option>
                    <option value="other">Other</option>
                  </select>
                </label>
              </>
            )}
            {mode === 'volunteer' && (
              <>
                <label>
                  Volunteer role
                  <select
                    value={form.kind}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        kind: e.target.value as VolunteerKind,
                      })
                    }
                  >
                    <option value="mentor">Mentor</option>
                    <option value="judge">Judge</option>
                    <option value="ambassador">Ambassador</option>
                    <option value="exhibitor">Exhibitor</option>
                  </select>
                </label>
                <label>
                  Phone (optional)
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </label>
                <label>
                  Expertise
                  <input
                    value={form.expertise}
                    onChange={(e) => setForm({ ...form, expertise: e.target.value })}
                  />
                </label>
                <label>
                  Faculty (optional)
                  <input
                    value={form.faculty}
                    onChange={(e) => setForm({ ...form, faculty: e.target.value })}
                  />
                </label>
              </>
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
