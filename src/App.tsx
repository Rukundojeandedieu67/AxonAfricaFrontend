import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { AboutPage } from './pages/About'
import { ApplyPage } from './pages/Apply'
import { GetInvolvedPage } from './pages/GetInvolved'
import { HomePage } from './pages/Home'
import { InnovatorsPage } from './pages/Innovators'
import { ProgramPage } from './pages/Program'
import { StoriesPage } from './pages/Stories'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="program" element={<ProgramPage />} />
          <Route path="apply" element={<ApplyPage />} />
          <Route path="innovators" element={<InnovatorsPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="get-involved" element={<GetInvolvedPage />} />
          <Route path="stories" element={<StoriesPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
