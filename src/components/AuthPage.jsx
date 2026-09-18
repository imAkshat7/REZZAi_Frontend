import { useState } from 'react'
import { signInWithPopup } from 'firebase/auth'
import { Auth, googleProvider } from '../../utils/firebase'
import authApi from '../../utils/axios'

const AuthPage = ({ onAuthenticated }) => {
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [error, setError] = useState('')

  const signInWithGoogle = async () => {
    setIsSigningIn(true)
    setError('')
    try {
      const result = await signInWithPopup(Auth, googleProvider)
      const token = await result.user.getIdToken()
      const response = await authApi.post('/login', { token })
      const data = response.data
      const authToken = data?.token || token
      if (authToken) {
        localStorage.setItem('rezzai_token', authToken)
      }
      onAuthenticated(data?.user || data)
    } catch (signInError) {
      setError(signInError.response?.data?.message || signInError.message || 'Google sign-in could not be completed.')
    } finally {
      setIsSigningIn(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-noise" />
      <nav className="auth-nav"><a className="brand" href="/" aria-label="REZZAi home"><span className="brand-mark">R</span><span>REZZAi</span></a><span className="auth-nav-note">Private intelligence workspace</span></nav>
      <section className="auth-content">
        <div className="auth-copy"><p className="eyebrow"><span /> Welcome back</p><h1>Make room for<br /><em>better thinking.</em></h1><p>One considered workspace for your questions, projects, research, and next good idea.</p></div>
        <div className="auth-card"><div className="auth-orbit">✦</div><p className="auth-card-kicker">Your workspace is waiting</p><h2>Sign in to REZZAi</h2><p className="auth-card-copy">Continue with your Google account to access your conversations and agents.</p><button className="google-signin" type="button" onClick={signInWithGoogle} disabled={isSigningIn}><span className="google-glyph">G</span><span>{isSigningIn ? 'Connecting...' : 'Continue with Google'}</span><span className="signin-arrow">→</span></button>{error && <p className="auth-error" role="alert">{error}</p>}<small>Secure sign-in. Your conversations stay in your account.</small></div>
      </section>
      <footer className="auth-footer"><span>REZZAi / 2026</span><span>Think clearly. Move deliberately.</span></footer>
    </main>
  )
}

export default AuthPage
