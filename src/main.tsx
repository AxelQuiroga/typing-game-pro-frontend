import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// NOTE: StrictMode intentionally omitted — it causes double-renders
// which interfere with requestAnimationFrame game loops and produce
// flickering. This is a deliberate architecture decision for game dev.
createRoot(document.getElementById('root')!).render(<App />)
