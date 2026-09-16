import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { WorkspaceProvider } from './state/WorkspaceContext'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <WorkspaceProvider>
        <App />
      </WorkspaceProvider>
    </BrowserRouter>
  </StrictMode>,
)
