import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './components/App'
import './index.css'
import './fonts.css'
import { isEnvBrowser } from './utils/misc'
import LocaleProvider from './providers/LocaleProvider'
import ErrorBoundary from './providers/ErrorBoundary'

if (isEnvBrowser()) {
  const root = document.getElementById('root')
  root!.style.backgroundImage = 'url("./images/bg.png")'
  root!.style.backgroundSize = 'cover'
  root!.style.backgroundRepeat = 'no-repeat'
  root!.style.backgroundPosition = 'center'
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
    <LocaleProvider>
        <App />
    </LocaleProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
