import { useEffect, useState } from 'react'
import { api, unwrapList, type TeamMember } from '../api/client'
import { MediaFrame } from '../components/MediaFrame'
import { Reveal } from '../components/Reveal'
import { siteMedia } from '../data/siteMedia'

const fallbackTeam = [
  {
    id: 1,
    full_name: 'Ferdinand Hashimwimana',
    role_title: 'Founder & Executive Director',
    bio: 'Leading AxonAfrica’s mission to close Africa’s health innovation gap.',
  },
]

export function AboutPage() {
  const [team, setTeam] = useState<TeamMember[]>(fallbackTeam)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const data = await api.team()
        const list = unwrapList(data)
        if (alive && list.length) setTeam(list)
      } catch {
        /* keep fallback */
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <p className="eyebrow eyebrow--on-dark">About &amp; Team</p>
          <h1>A youth-led organization with a serious purpose.</h1>
          <p>
            AxonAfrica closes the gap between brilliant health ideas and deployed solutions —
            carrying scholars from classroom insight to institutional impact.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container media-story__grid">
          <div style={{ display: 'grid', gap: '1.25rem' }}>
            <Reveal>
              <p className="eyebrow eyebrow--leaf">Our story</p>
              <h2 className="section-title">The gap we close</h2>
              <p>
                Africa graduates health scholars who can diagnose, model, and design on paper. Almost
                none of that knowledge becomes a solution tested in a real institution. AxonAfrica is
                the carrier that makes that journey possible — end to end.
              </p>
            </Reveal>
            <Reveal>
              <div className="grid-3" style={{ gridTemplateColumns: '1fr' }}>
                <article className="card card--soft">
                  <h3 style={{ color: 'var(--deep-green)' }}>Mission</h3>
                  <p style={{ margin: 0 }}>
                    Empower the next generation of African health leaders to turn digitally-native
                    ideas into solutions tested where they matter.
                  </p>
                </article>
                <article className="card card--soft">
                  <h3 style={{ color: 'var(--deep-green)' }}>Vision</h3>
                  <p style={{ margin: 0 }}>
                    A continent where youth-led health innovation is the default path from classroom
                    to impact — not the exception.
                  </p>
                </article>
              </div>
            </Reveal>
          </div>
          <Reveal delay={100} variant="scale">
            <MediaFrame
              videoSrc={siteMedia.about.storyVideo}
              poster={siteMedia.about.storyPoster || undefined}
              caption={siteMedia.about.storyCaption}
              placeholderLabel="Founder / team story video"
            />
          </Reveal>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--off-white)' }}>
        <div className="container">
          <Reveal>
            <p className="eyebrow eyebrow--leaf">Team</p>
            <h2 className="section-title">Meet the people leading the work</h2>
          </Reveal>
          <div className="grid-3" style={{ marginTop: '1.5rem' }}>
            {team.map((member) => (
              <Reveal key={member.id}>
                <article
                  className="card"
                  style={{ padding: member.photo ? 0 : undefined, overflow: 'hidden' }}
                >
                  {member.photo ? (
                    <MediaFrame src={member.photo} alt={member.full_name} aspect="4/3" />
                  ) : null}
                  <div style={{ padding: member.photo ? '1.15rem 1.25rem 1.35rem' : undefined }}>
                    <h3 style={{ color: 'var(--deep-green)', fontSize: '1.1rem', marginBottom: 4 }}>
                      {member.full_name}
                    </h3>
                    <p className="eyebrow eyebrow--leaf" style={{ marginBottom: '0.5rem' }}>
                      {member.role_title}
                    </p>
                    {member.bio && <p style={{ margin: 0 }}>{member.bio}</p>}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
          <p
            style={{
              marginTop: '1.5rem',
              color: 'color-mix(in srgb, var(--ink) 70%, transparent)',
            }}
          >
            Board &amp; Advisory Council members will appear here as they are confirmed.
          </p>
        </div>
      </section>
    </>
  )
}
