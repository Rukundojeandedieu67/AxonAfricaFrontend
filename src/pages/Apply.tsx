import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { ApiError, api, type ApplicationPayload, type ApplicationWindow } from '../api/client'
import { HeroBackgroundSlides } from '../components/HeroBackgroundSlides'

const DRAFT_KEY = 'axonafrica-apply-draft'

type Draft = Omit<ApplicationPayload, 'cv' | 'pitch_deck'> & {
  skillsHave: string
  skillsNeed: string
  motivation: string
  availability: string
  consent: boolean
}

const empty: Draft = {
  full_name: '',
  email: '',
  phone: '',
  country: '',
  university: '',
  faculty: '',
  year_of_study: 1,
  idea_title: '',
  problem_statement: '',
  idea_summary: '',
  skillsHave: '',
  skillsNeed: '',
  motivation: '',
  availability: '',
  consent: false,
}

const steps = ['About you', 'Your idea', 'Your team', 'Commitment'] as const

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(value))
}

function formatCountdown(milliseconds: number) {
  const seconds = Math.max(0, Math.floor(milliseconds / 1000))
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainder = seconds % 60
  return `${days}d ${hours}h ${minutes}m ${remainder}s`
}

export function ApplyPage() {
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<Draft>(empty)
  const [cv, setCv] = useState<File | null>(null)
  const [pitchDeck, setPitchDeck] = useState<File | null>(null)
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [applicationWindow, setApplicationWindow] = useState<ApplicationWindow | null>(null)
  const [windowError, setWindowError] = useState('')
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    let alive = true
    api.applicationWindow()
      .then((window) => {
        if (alive) setApplicationWindow(window)
      })
      .catch(() => {
        if (alive) setWindowError('We could not check the application window. Please try again later.')
      })
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    if (!applicationWindow?.opens_at && !applicationWindow?.deadline) return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [applicationWindow?.opens_at, applicationWindow?.deadline])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (raw) setDraft({ ...empty, ...JSON.parse(raw) })
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    if (status === 'done') {
      localStorage.removeItem(DRAFT_KEY)
      return
    }
    const id = window.setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    }, 400)
    return () => window.clearTimeout(id)
  }, [draft, status])

  const progress = useMemo(() => ((step + 1) / steps.length) * 100, [step])
  const opensAt = applicationWindow?.opens_at
  const deadline = applicationWindow?.deadline
  const remainingMs = deadline
    ? new Date(deadline).getTime() - now
    : 0
  const applicationStatus: 'upcoming' | 'open' | 'closed' = !applicationWindow
    ? 'closed'
    : applicationWindow.is_open || applicationWindow.status === 'open'
      ? 'open'
      : applicationWindow.status === 'upcoming' ||
          (Boolean(opensAt) && now < new Date(opensAt as string).getTime())
        ? 'upcoming'
        : 'closed'
  const windowIsOpen = applicationStatus === 'open'

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }))
  }

  function validateStep() {
    if (step === 0) {
      return Boolean(
        draft.full_name &&
          draft.email &&
          draft.country &&
          draft.university &&
          draft.faculty &&
          draft.year_of_study,
      )
    }
    if (step === 1) {
      return Boolean(draft.idea_title && draft.problem_statement && draft.idea_summary)
    }
    if (step === 2) {
      return Boolean(draft.skillsHave)
    }
    return draft.consent && Boolean(draft.motivation && draft.availability)
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validateStep()) {
      setMessage('Please complete the required fields before continuing.')
      setStatus('error')
      return
    }
    if (step < steps.length - 1) {
      setStatus('idle')
      setMessage('')
      setStep((s) => s + 1)
      return
    }

    setStatus('saving')
    setMessage('')
    const idea_summary = [
      draft.idea_summary,
      draft.skillsHave && `Skills I bring: ${draft.skillsHave}`,
      draft.skillsNeed && `Skills I need: ${draft.skillsNeed}`,
      draft.availability && `Availability: ${draft.availability}`,
      draft.motivation && `Motivation: ${draft.motivation}`,
    ]
      .filter(Boolean)
      .join('\n\n')

    try {
      await api.submitApplication({
        full_name: draft.full_name,
        email: draft.email,
        phone: draft.phone,
        country: draft.country,
        university: draft.university,
        faculty: draft.faculty,
        year_of_study: Number(draft.year_of_study),
        idea_title: draft.idea_title,
        problem_statement: draft.problem_statement,
        idea_summary,
        ...(cv ? { cv } : {}),
        ...(pitchDeck ? { pitch_deck: pitchDeck } : {}),
      })
      localStorage.removeItem(DRAFT_KEY)
      setDraft(empty)
      setCv(null)
      setPitchDeck(null)
      setStatus('done')
      setMessage(
        'Thank you. Your application is in. We will email you with the next step.',
      )
    } catch (err) {
      setStatus('error')
      setMessage(
        err instanceof ApiError
          ? err.message
          : 'Network error. Your draft is saved on this device — try again when you are online.',
      )
    }
  }

  return (
    <>
      <section className="page-hero">
        <HeroBackgroundSlides />
        <div className="container">
          <p className="eyebrow eyebrow--on-dark">Apply</p>
          <h1>Tell us about the idea that will not leave you alone.</h1>
          <p>
            {windowIsOpen
              ? 'Applications are open now. Your progress saves automatically on this device.'
              : 'Check the current application window and deadline below.'}
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 640 }}>
          {status === 'done' ? (
            <div className="card card--soft">
              <h2 style={{ color: 'var(--heading-color)' }}>Application received</h2>
              <p className="form-ok">{message}</p>
            </div>
          ) : windowError ? (
            <div className="card card--soft" role="alert">
              <h2 style={{ color: 'var(--heading-color)' }}>Application status unavailable</h2>
              <p className="form-error">{windowError}</p>
            </div>
          ) : !applicationWindow ? (
            <div className="card card--soft" role="status">
              <p>Checking the application window…</p>
            </div>
          ) : !windowIsOpen ? (
            <div className="card card--soft" role="status">
              <h2 style={{ color: 'var(--heading-color)' }}>
                {applicationStatus === 'upcoming'
                  ? 'Applications are not open yet'
                  : 'Applications are currently closed'}
              </h2>
              {applicationStatus === 'upcoming' && applicationWindow.opens_at ? (
                <p>
                  Applications open on <strong>{formatDate(applicationWindow.opens_at)}</strong>.
                </p>
              ) : applicationWindow.deadline &&
                remainingMs <= 0 &&
                applicationWindow.opens_at ? (
                <p>
                  This application window closed on <strong>{formatDate(applicationWindow.deadline)}</strong>.
                </p>
              ) : (
                <p>There is no active application window. Please check back for the next cohort.</p>
              )}
            </div>
          ) : (
            <>
              <div className="card card--soft" style={{ marginBottom: '1rem' }} role="status">
                <h2 style={{ color: 'var(--heading-color)' }}>Applications are open</h2>
                {applicationWindow.opens_at && (
                  <p>Opened: <strong>{formatDate(applicationWindow.opens_at)}</strong></p>
                )}
                {applicationWindow.deadline && (
                  <p>Deadline: <strong>{formatDate(applicationWindow.deadline)}</strong></p>
                )}
                <p>
                  Time remaining: <strong>{formatCountdown(remainingMs)}</strong>
                </p>
              </div>
              <form className="card" onSubmit={onSubmit}>
              <div style={{ marginBottom: '1.25rem' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    marginBottom: '0.5rem',
                    fontWeight: 600,
                    color: 'var(--heading-color)',
                  }}
                >
                  <span>
                    Step {step + 1} of {steps.length}: {steps[step]}
                  </span>
                  <span aria-live="polite">{Math.round(progress)}%</span>
                </div>
                <div
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(progress)}
                  style={{
                    height: 8,
                    borderRadius: 999,
                    background: 'var(--off-white)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${progress}%`,
                      height: '100%',
                      background: 'var(--leaf-green)',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>

              <div className="form-stack">
                {step === 0 && (
                  <>
                    <label>
                      Full name
                      <input
                        required
                        value={draft.full_name}
                        onChange={(e) => update('full_name', e.target.value)}
                      />
                    </label>
                    <label>
                      Email
                      <input
                        type="email"
                        required
                        value={draft.email}
                        onChange={(e) => update('email', e.target.value)}
                      />
                    </label>
                    <label>
                      Phone
                      <input
                        value={draft.phone}
                        onChange={(e) => update('phone', e.target.value)}
                      />
                    </label>
                    <label>
                      University or organization
                      <input
                        required
                        value={draft.university}
                        onChange={(e) => update('university', e.target.value)}
                      />
                    </label>
                    <label>
                      Faculty and year
                      <input
                        required
                        value={draft.faculty}
                        onChange={(e) => update('faculty', e.target.value)}
                      />
                    </label>
                    <label>
                      Year of study (number)
                      <input
                        type="number"
                        min={1}
                        max={10}
                        required
                        value={draft.year_of_study}
                        onChange={(e) => update('year_of_study', Number(e.target.value))}
                      />
                    </label>
                    <label>
                      Country
                      <input
                        required
                        value={draft.country}
                        onChange={(e) => update('country', e.target.value)}
                      />
                    </label>
                  </>
                )}

                {step === 1 && (
                  <>
                    <label>
                      Idea title
                      <input
                        required
                        value={draft.idea_title}
                        onChange={(e) => update('idea_title', e.target.value)}
                      />
                    </label>
                    <label>
                      The health problem you have seen
                      <textarea
                        required
                        value={draft.problem_statement}
                        onChange={(e) => update('problem_statement', e.target.value)}
                      />
                    </label>
                    <label>
                      Your proposed solution and what you have done so far
                      <textarea
                        required
                        value={draft.idea_summary}
                        onChange={(e) => update('idea_summary', e.target.value)}
                      />
                    </label>
                  </>
                )}

                {step === 2 && (
                  <>
                    <label>
                      Your strongest skills
                      <textarea
                        required
                        value={draft.skillsHave}
                        onChange={(e) => update('skillsHave', e.target.value)}
                      />
                    </label>
                    <label>
                      Skills you are missing (design, software, data…)
                      <textarea
                        value={draft.skillsNeed}
                        onChange={(e) => update('skillsNeed', e.target.value)}
                      />
                    </label>
                    <label>
                      CV (PDF, optional)
                      <input
                        type="file"
                        accept="application/pdf,.pdf"
                        onChange={(event) => setCv(event.target.files?.[0] ?? null)}
                      />
                    </label>
                    <label>
                      Pitch deck (PDF, optional)
                      <input
                        type="file"
                        accept="application/pdf,.pdf"
                        onChange={(event) => setPitchDeck(event.target.files?.[0] ?? null)}
                      />
                    </label>
                  </>
                )}

                {step === 3 && (
                  <>
                    <label>
                      Availability
                      <textarea
                        required
                        value={draft.availability}
                        onChange={(e) => update('availability', e.target.value)}
                      />
                    </label>
                    <label>
                      Short motivation statement
                      <textarea
                        required
                        value={draft.motivation}
                        onChange={(e) => update('motivation', e.target.value)}
                      />
                    </label>
                    <label style={{ display: 'flex', gap: '0.65rem', alignItems: 'flex-start' }}>
                      <input
                        type="checkbox"
                        checked={draft.consent}
                        onChange={(e) => update('consent', e.target.checked)}
                        style={{ width: 20, height: 20, marginTop: 2 }}
                      />
                      <span>
                        I confirm that I keep ownership of my idea, and that AxonAfrica will not use
                        it without informed consent and a formal agreement.
                      </span>
                    </label>
                  </>
                )}
              </div>

              {message && (
                <p className={status === 'error' ? 'form-error' : 'form-ok'} style={{ marginTop: '1rem' }}>
                  {message}
                </p>
              )}

              <div
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  marginTop: '1.5rem',
                  flexWrap: 'wrap',
                }}
              >
                {step > 0 && (
                  <button
                    type="button"
                    className="btn btn--outline-dark"
                    onClick={() => setStep((s) => s - 1)}
                  >
                    Back
                  </button>
                )}
                <button type="submit" className="btn btn--gold" disabled={status === 'saving'}>
                  {step === steps.length - 1
                    ? status === 'saving'
                      ? 'Submitting…'
                      : 'Submit application'
                    : 'Continue'}
                </button>
              </div>
              </form>
            </>
          )}
        </div>
      </section>
    </>
  )
}
