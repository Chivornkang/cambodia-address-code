import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AppProvider } from './store'
import '@fontsource/kantumruy-pro/khmer-400.css'
import '@fontsource/kantumruy-pro/khmer-600.css'
import '@fontsource/kantumruy-pro/khmer-700.css'
import '@fontsource/kantumruy-pro/latin-400.css'
import '@fontsource/kantumruy-pro/latin-600.css'
import '@fontsource/kantumruy-pro/latin-700.css'
import './styles.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <App />
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>
)
