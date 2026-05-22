import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const rootEl = document.getElementById('root');
// Mark as standalone so Routes.jsx uses BrowserRouter
if (rootEl) rootEl.dataset.standalone = 'true';

createRoot(rootEl).render(
  <StrictMode>
      <App />    
  </StrictMode>,
)
