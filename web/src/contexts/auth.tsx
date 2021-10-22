import { createContext, ReactNode, useEffect, useState } from 'react'
import { api } from '../services/api'

type User = {
  id: string;
  name: string;
  login: string;
  avatar_url: string;
}

type AuthContexData = {
  user: User | null;
  signInUrl: string;
  signOut: () => void;
}

type AuthResponse = {
  token: string;
  user: {
    id: string;
    avatar_url: string;
    name: string;
    login: string;
  }
}

type AuthProvider = {
  children: ReactNode;
}

export const AuthContext = createContext({} as AuthContexData)

export function AuthProvider(props: AuthProvider) {
  const [user, setUser] = useState<User | null>(null)
  const signInUrl = 'https://github.com/login/oauth/authorize?scope=user&client_id=08d141911c069d4e5c85'

  async function signIn(githubCode: string) {
    const response = await api.post<AuthResponse>('authenticate', {
      code: githubCode
    })

    const { token, user } = response.data;
    localStorage.setItem('token', token)
    api.defaults.headers.common.authorization = `Bearer ${token}`
    setUser(user)
  }

  function signOut() {
    setUser(null)
    localStorage.removeItem('token')
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      api.defaults.headers.common.authorization = `Bearer ${token}`
      api.get<User>('profile').then(response => {
        setUser(response.data)
      })
    }
  }, [])

  useEffect(() => {
    const url = window.location.href;
    const query = '?code='
    const hasGithubCode = url.includes(query)
    if (hasGithubCode) {
      const [urlWithoutCode, githubCode] = url.split(query)
      window.history.pushState({}, '', urlWithoutCode)
      signIn(githubCode)
    }
  })

  return (
    <AuthContext.Provider value={{ signInUrl, user, signOut }}>
      {props.children}
    </AuthContext.Provider>
  )
}