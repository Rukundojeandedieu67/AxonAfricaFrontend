import { Link } from 'react-router-dom'
import './Logo.css'

type Props = {
  /** Footer / dark surfaces: use a flush white plate */
  onDark?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function Logo({ onDark = false, size = 'md' }: Props) {
  return (
    <Link to="/" className={`logo-link logo-link--${size}`} aria-label="AxonAfrica home">
      <span className={`logo-frame ${onDark ? 'logo-frame--flush' : ''}`}>
        <img
          src="/logo-axonafrica.png"
          alt="AxonAfrica"
          className="logo-img"
          width={220}
          height={64}
          decoding="async"
        />
      </span>
    </Link>
  )
}
