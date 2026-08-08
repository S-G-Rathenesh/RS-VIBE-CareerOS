import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import App from './App.tsx'
import { ErrorBoundary } from './components/common/ErrorBoundary.tsx'
import './index.css'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy_client_id'

console.log(`[Diagnostic] VITE_GOOGLE_CLIENT_ID present: ${!!import.meta.env.VITE_GOOGLE_CLIENT_ID}`)
if (import.meta.env.VITE_GOOGLE_CLIENT_ID) {
  console.log(`[Diagnostic] VITE_GOOGLE_CLIENT_ID length: ${import.meta.env.VITE_GOOGLE_CLIENT_ID.length}`)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <App />
      </GoogleOAuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)
