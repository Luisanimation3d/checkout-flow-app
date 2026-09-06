import { Route, Routes } from 'react-router-dom'
import './App.scss'
import { PDP } from '@/pages/PDP'
import { PLP } from '@/pages/PLP'
import { PaymentStatus } from '@/pages/PaymentStatus'

function App() {
  return (
    <Routes>
      <Route path="/" element={<PLP />} />
      <Route path="/product/:id" element={<PDP />} />
      <Route path="/status" element={<PaymentStatus />} />
    </Routes>
  )
}

export default App
