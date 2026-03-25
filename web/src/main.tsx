import React from 'react';
import ReactDOM from 'react-dom/client';
import { VisibilityProvider } from './providers/VisibilityProvider';
import App from './components/App';
import { DevTools } from './dev/DevTools';
import './index.css';
import { isEnvBrowser } from './utils/misc';

const root = document.getElementById('root');

document.documentElement.classList.add('dark')

if (isEnvBrowser()) {
  // https://i.imgur.com/iPTAdYV.png - Night time imgur
  root!.style.backgroundImage = 'url("https://i.imgur.com/iPTAdYV.png")';
  root!.style.backgroundSize = 'cover';
  root!.style.backgroundRepeat = 'no-repeat';
  root!.style.backgroundPosition = 'center';
}


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <>
      <VisibilityProvider>
        <App />
      </VisibilityProvider>
      <DevTools />
    </>
  </React.StrictMode>,
);
