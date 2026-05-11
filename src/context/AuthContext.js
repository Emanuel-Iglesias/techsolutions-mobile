import { createContext, useContext, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)

  const login = async (token, userData) => {
    await AsyncStorage.setItem('token', token)
    await AsyncStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = async () => {
    await AsyncStorage.removeItem('token')
    await AsyncStorage.removeItem('user')
    setUser(null)
  }

  const loadUser = async () => {
    const userData = await AsyncStorage.getItem('user')
    if (userData) setUser(JSON.parse(userData))
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loadUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)