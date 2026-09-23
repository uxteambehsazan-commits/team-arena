import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { BUILD_INFO } from './lib/buildInfo'

// Deployment fingerprint
console.info(`[TeamArena] v${BUILD_INFO.version} | build: ${BUILD_INFO.buildId} | cache: ${BUILD_INFO.cacheKey}`)

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: boolean }> {
  state = { error: false }
  static getDerivedStateFromError() { return { error: true } }
  componentDidCatch(error: Error) {
    // Hooks-order mismatch from HMR: always reload, no guard
    if (
      error.message.includes('Hooks') ||
      error.message.includes('queue') ||
      error.message.includes('hook')
    ) {
      window.location.reload()
      return
    }
    // Other errors: reload once per session to recover
    const reloaded = sessionStorage.getItem('eb_reloaded')
    if (!reloaded) {
      sessionStorage.setItem('eb_reloaded', '1')
      window.location.reload()
    }
  }
  render() {
    if (this.state.error) {
      return (
        <div dir="rtl" style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#111112', color: '#fff', gap: 16, fontFamily: 'sans-serif' }}>
          <div style={{ fontSize: 48 }}>⚠️</div>
          <p style={{ fontSize: 18, fontWeight: 'bold' }}>خطایی رخ داد</p>
          <button
            onClick={() => { sessionStorage.removeItem('eb_reloaded'); window.location.reload() }}
            style={{ background: '#CC2229', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 28px', fontSize: 16, fontWeight: 'bold', cursor: 'pointer' }}>
            بارگذاری مجدد
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

// Reuse existing root across HMR updates to avoid the "createRoot on same
// container" warning that fires when Vite re-executes this module.
const container = document.getElementById('root')!
const existingRoot = (container as any).__reactRoot as ReactDOM.Root | undefined
const root = existingRoot ?? ReactDOM.createRoot(container)
if (!existingRoot) (container as any).__reactRoot = root

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
