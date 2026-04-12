import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'college-erp-theme/css'
import 'college-erp-theme/colleges/pvg/config.css'
import './base.css'
// import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
