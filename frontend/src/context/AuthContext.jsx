import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api, clearCache } from '../api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [username, setUsername] = useState(() => localStorage.getItem('hu_username'))
  const [token, setToken] = useState(() => localStorage.getItem('hu_token'))
  const [ready, setReady] = useState(false)

  useEffect(() => {
    function handleUnauthorized() {
      setToken(null)
      setUsername(null)
    }
    window.addEventListener('hu:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('hu:unauthorized', handleUnauthorized)
  }, [])

  useEffect(() => {
    async function checkSession() {
      if (token) {
        try {
          const me = await api.me()
          setUsername(me.username)
          localStorage.setItem('hu_username', me.username)
        } catch (err) {
          // only a real "your session is invalid" answer (401) should log the user out.
          // if the server just can't be reached (offline), keep them logged in.
          if (err.status === 401) {
            setToken(null)
            setUsername(null)
          }
        }
      }
      setReady(true)
    }
    checkSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const applySession = useCallback((accessToken, uname) => {
    clearCache()
    localStorage.setItem('hu_token', accessToken)
    localStorage.setItem('hu_username', uname)
    setToken(accessToken)
    setUsername(uname)
  }, [])

  const signup = useCallback(
    async (uname, password) => {
      await api.signup(uname, password)
      const session = await api.login(uname, password)
      applySession(session.access_token, uname)
    },
    [applySession]
  )

  const login = useCallback(
    async (uname, password) => {
      const session = await api.login(uname, password)
      applySession(session.access_token, uname)
    },
    [applySession]
  )

  const logout = useCallback(() => {
    clearCache()
    localStorage.removeItem('hu_token')
    localStorage.removeItem('hu_username')
    setToken(null)
    setUsername(null)
  }, [])

  const renameLocal = useCallback((uname) => {
    localStorage.setItem('hu_username', uname)
    setUsername(uname)
  }, [])

  return (
    <AuthContext.Provider
      value={{ username, token, ready, isAuthed: !!token, signup, login, logout, renameLocal }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
