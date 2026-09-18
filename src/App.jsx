import { useEffect, useState } from 'react'
import AuthPage from './components/AuthPage'
import Home from './pages/Home'
import { API_BASE_URL } from '../utils/axios'

const App = () => {
	const [user, setUser] = useState(null)
	const [checkingSession, setCheckingSession] = useState(true)

	useEffect(() => {
		const token = localStorage.getItem('rezzai_token')
		const headers = token ? { Authorization: `Bearer ${token}` } : {}
		fetch(`${API_BASE_URL}/me`, { credentials: 'include', headers })
			.then((response) => response.ok ? response.json() : null)
			.then(setUser)
			.finally(() => setCheckingSession(false))
	}, [])

	const handleLogout = async () => {
		try {
			const token = localStorage.getItem('rezzai_token')
			const headers = token ? { Authorization: `Bearer ${token}` } : {}
			await fetch(`${API_BASE_URL}/logout`, { method: 'POST', credentials: 'include', headers })
		} catch (error) {
			console.error('Logout failed:', error)
		} finally {
			localStorage.removeItem('rezzai_token')
			setUser(null)
		}
	}


	if (checkingSession) return <div className="session-loader">Loading your workspace...</div>
	if (!user) return <AuthPage onAuthenticated={setUser} />
	return <Home user={user} onLogout={handleLogout} />
}

export default App