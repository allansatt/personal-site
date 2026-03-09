import 'App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginBar from 'features/login/components/LoginBar'
import LandingPage from 'pages/LandingPage'
import PokerHandsPage from 'features/pokerhands/components/PokerHandsPage'


function App() {
  return (
    <BrowserRouter>
      <LoginBar/>
      <Routes>
        <Route path="/" element={<LandingPage/>} />
        <Route path="/pokerhands" element={<PokerHandsPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
