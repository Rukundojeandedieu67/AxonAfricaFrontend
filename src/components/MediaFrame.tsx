import { useRef, useState, type ReactNode } from 'react'
import './MediaFrame.css'

type Props = {
  src?: string | null
  alt?: string
  videoSrc?: string | null
  /** YouTube video id (e.g. dQw4w9WgXcQ) — used when no videoSrc file */
  youtubeId?: string | null
  poster?: string | null
  aspect?: '16/9' | '4/3' | '1/1' | '3/4'
  className?: string
  tint?: boolean
  caption?: ReactNode
  placeholderLabel?: string
  autoPlayMuted?: boolean
}

export function MediaFrame({
  src,
  alt = '',
  videoSrc,
  youtubeId,
  poster,
  aspect = '16/9',
  className = '',
  tint = true,
  caption,
  placeholderLabel = 'Media coming soon',
  autoPlayMuted = false,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(autoPlayMuted)
  const [failed, setFailed] = useState(false)
  const hasYoutube = Boolean(youtubeId)
  const hasVideo = Boolean(videoSrc) && !failed
  const hasImage = Boolean(src)

  function togglePlay() {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      void v.play()
      setPlaying(true)
    } else {
      v.pause()
      setPlaying(false)
    }
  }

  return (
    <figure className={`media-frame media-frame--${aspect.replace('/', 'x')} ${className}`.trim()}>
      <div className={`media-frame__surface ${tint && !hasYoutube ? 'media-frame__surface--tint' : ''}`}>
        {hasYoutube ? (
          <iframe
            className="media-frame__media media-frame__iframe"
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0&modestbranding=1`}
            title={alt || 'Video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        ) : hasVideo ? (
          <>
            <video
              ref={videoRef}
              className="media-frame__media"
              src={videoSrc!}
              poster={poster || src || undefined}
              playsInline
              preload="metadata"
              muted={autoPlayMuted}
              loop={autoPlayMuted}
              autoPlay={autoPlayMuted}
              onError={() => setFailed(true)}
              onEnded={() => setPlaying(false)}
              onPause={() => setPlaying(false)}
              onPlay={() => setPlaying(true)}
            />
            {!autoPlayMuted && (
              <button
                type="button"
                className={`media-frame__play ${playing ? 'is-playing' : ''}`}
                onClick={togglePlay}
                aria-label={playing ? 'Pause video' : 'Play video'}
              >
                <span aria-hidden>{playing ? '❚❚' : '▶'}</span>
              </button>
            )}
          </>
        ) : hasImage ? (
          <img className="media-frame__media" src={src!} alt={alt} loading="lazy" decoding="async" />
        ) : (
          <div className="media-frame__placeholder" role="img" aria-label={placeholderLabel}>
            <span className="media-frame__placeholder-icon" aria-hidden>
              ▶
            </span>
            <span>{placeholderLabel}</span>
          </div>
        )}
      </div>
      {caption && <figcaption className="media-frame__caption">{caption}</figcaption>}
    </figure>
  )
}
