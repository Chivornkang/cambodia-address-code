import { useEffect, useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import NotFoundBox from './components/NotFoundBox'
import SearchOverlay from './components/SearchOverlay'
import Home from './pages/Home'
import Provinces from './pages/Provinces'
import ProvinceDetail from './pages/ProvinceDetail'
import DistrictDetail from './pages/DistrictDetail'
import CommuneDetail from './pages/CommuneDetail'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  const [searchOpen, setSearchOpen] = useState(false)

  // "/" or Ctrl/⌘+K opens search, Esc closes it
  useEffect(() => {
    const onKey = (e) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName)
      if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !typing)) {
        e.preventDefault()
        setSearchOpen(true)
      } else if (e.key === 'Escape') {
        setSearchOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <ScrollToTop />
      <Navbar onSearch={() => setSearchOpen(true)} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/provinces" element={<Provinces />} />
          <Route path="/province/:code" element={<ProvinceDetail />} />
          <Route path="/district/:code" element={<DistrictDetail />} />
          <Route path="/commune/:code" element={<CommuneDetail />} />
          <Route path="*" element={<NotFoundBox />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
