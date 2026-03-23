import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './components/App'
import './index.css'
import { isEnvBrowser } from './utils/misc'
import { VisibilityProvider } from './providers/VisibilityProvider'
import { LocaleProvider } from './providers/LocaleProvider'

const root = document.getElementById('root')
const html = document.documentElement
html.classList.add('dark-theme');
html.setAttribute('data-theme', 'dark');

if (isEnvBrowser()) {
  // https://i.imgur.com/iPTAdYV.png - Night time img
  root!.style.backgroundImage = 'url("https://i.imgur.com/iPTAdYV.png")'
  // root!.style.backgroundImage = 'url("https://i.imgur.com/3pzRj9n.png")'
  root!.style.backgroundSize = 'cover'
  root!.style.backgroundRepeat = 'no-repeat'
  root!.style.backgroundPosition = 'center'
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LocaleProvider>
      <VisibilityProvider>
        <App />
      </VisibilityProvider>
    </LocaleProvider>
  </React.StrictMode>,
)
