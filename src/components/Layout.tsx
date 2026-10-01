import { Outlet } from 'react-router-dom'
import { Footer } from './Footer'
import { Header } from './Header'
import { PageMotion } from './PageMotion'

export function Layout() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main">
        <PageMotion>
          <Outlet />
        </PageMotion>
      </main>
      <Footer />
    </>
  )
}
