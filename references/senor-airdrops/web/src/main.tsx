import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { VisibilityProvider } from './providers/VisibilityProvider'
import './index.css'
import { isEnvBrowser } from './utils/misc.ts'
import App from './components/App.tsx'
import { ThemeProvider } from './providers/ThemeProvider.tsx'
import { LocaleProvider } from './providers/LocaleProvider.tsx'
import ErrorBoundary from './providers/ErrorBoundary.tsx'
import { Toaster } from './components/ui/toaster.tsx'
import Countdown from './components/Countdown/index.tsx'

const root = document.getElementById('root')

if (isEnvBrowser()) {
  // https://i.imgur.com/iPTAdYV.png - Night time img
  // root!.style.backgroundImage = 'url("https://i.imgur.com/3pzRj9n.png")';
  root!.style.backgroundImage = 'url("https://i.imgur.com/iPTAdYV.png")'
  root!.style.backgroundSize = 'cover'
  root!.style.backgroundRepeat = 'no-repeat'
  root!.style.backgroundPosition = 'center'
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <LocaleProvider>
          <VisibilityProvider>
            <App />
            <Toaster />
          </VisibilityProvider>
          <Countdown/>
        </LocaleProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
)
