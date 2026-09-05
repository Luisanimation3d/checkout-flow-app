import { Route, Routes } from 'react-router-dom'
import './App.scss'
import { PDP } from '@/pages/PDP'
import { PaymentStatus } from '@/pages/PaymentStatus'

function App() {
  return (
    <Routes>
      <Route path="/" element={<PDP />} />
      <Route path="/status" element={<PaymentStatus />} />
    </Routes>
  )
}

export default App
