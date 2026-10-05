import { useEffect, useState, type FormEvent } from 'react'
import { api, unwrapList, type NewsPost } from '../api/client'
import { HeroBackgroundSlides } from '../components/HeroBackgroundSlides'
import { MediaFrame } from '../components/MediaFrame'
import { Reveal } from '../components/Reveal'
import { siteMedia } from '../data/siteMedia'

export function StoriesPage() {
  const [posts, setPosts] = useState<NewsPost[]>([])
  const [contact, setContact] = useState({ name: '', email: '', message: '' })
  const [note, setNote] = useState('')

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const data = await api.news()
        if (alive) setPosts(unwrapList(data))
      } catch {
        if (alive) setPosts([])
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  function onContact(e: FormEvent) {
    e.preventDefault()
    setNote('Thanks — for now, please also email contact@axonafrica.org so the team can reply.')
    setContact({ name: '', email: '', message: '' })
  }

  return (
    <>
      <section className="page-hero">
        <HeroBackgroundSlides />
        <div className="container">
          <p className="eyebrow eyebrow--on-dark">Stories &amp; Contact</p>
          <h1>Updates from the work, and a direct line to the team.</h1>
          <p>Cohort stories, innovator profiles, and a short message form — no physical address.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal>
            <p className="eyebrow eyebrow--leaf">Featured</p>
            <h2 className="section-title">Watch &amp; read</h2>
          </Reveal>
          <div className="grid-3" style={{ marginTop: '1.5rem' }}>
            <Reveal delay={0}>
              <MediaFrame
                videoSrc={siteMedia.stories.featuredVideo}
                poster={siteMedia.stories.featuredPoster || undefined}
                aspect="16/9"
                caption="Featured story video — replace via VITE_STORIES_VIDEO_URL."
              />
            </Reveal>
            <Reveal delay={100}>
              <MediaFrame
                src={siteMedia.stories.workspaceImage || undefined}
                videoSrc={siteMedia.stories.workspaceImage ? undefined : siteMedia.home.highlightVideo}
                aspect="16/9"
                caption="Workspace / cohort photo or clip."
                placeholderLabel="Workspace photo"
              />
            </Reveal>
            <Reveal delay={200}>
              <MediaFrame
                videoSrc={siteMedia.about.storyVideo}
                aspect="16/9"
                caption="Team moment — replace with real footage."
                placeholderLabel="Team moment"
              />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: 'var(--off-white)' }}>
        <div className="container">
          <Reveal>
            <p className="eyebrow eyebrow--leaf">Stories</p>
            <h2 className="section-title">Latest from AxonAfrica</h2>
          </Reveal>
          {posts.length === 0 ? (
            <p style={{ marginTop: '1rem' }}>
              Stories will appear here as the team publishes cohort updates.
            </p>
          ) : (
            <div className="grid-3" style={{ marginTop: '1.5rem' }}>
              {posts.map((post, i) => (
                <Reveal key={post.id} delay={i * 80}>
                  <article className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <MediaFrame
                      src={post.cover_image}
                      alt=""
                      aspect="16/9"
                      placeholderLabel={post.title}
                    />
                    <div style={{ padding: '1.15rem 1.25rem 1.35rem' }}>
                      <h3 style={{ color: 'var(--heading-color)', fontSize: '1.15rem' }}>
                        {post.title}
                      </h3>
                      <p style={{ margin: 0 }}>{post.excerpt}</p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 640 }}>
          <Reveal>
            <p className="eyebrow eyebrow--leaf">Contact</p>
            <h2 className="section-title">Message the team</h2>
            <p>
              Email:{' '}
              <a href="mailto:contact@axonafrica.org" style={{ color: 'var(--leaf-green)' }}>
                contact@axonafrica.org
              </a>
            </p>
          </Reveal>
          <form className="card form-stack" onSubmit={onContact} style={{ marginTop: '1rem' }}>
            <label>
              Name
              <input
                required
                value={contact.name}
                onChange={(e) => setContact({ ...contact, name: e.target.value })}
              />
            </label>
            <label>
              Email
              <input
                type="email"
                required
                value={contact.email}
                onChange={(e) => setContact({ ...contact, email: e.target.value })}
              />
            </label>
            <label>
              Message
              <textarea
                required
                value={contact.message}
                onChange={(e) => setContact({ ...contact, message: e.target.value })}
              />
            </label>
            {note && <p className="form-ok">{note}</p>}
            <button type="submit" className="btn btn--gold">
              Send message
            </button>
          </form>
        </div>
      </section>
    </>
  )
}
