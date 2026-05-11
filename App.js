import { useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { StatusBar } from 'expo-status-bar'
import { AuthProvider, useAuth } from './src/context/AuthContext'

import LoginScreen from './src/screens/auth/LoginScreen'
import DashboardScreen from './src/screens/DashboardScreen'
import ProjectListScreen from './src/screens/projects/ProjectListScreen'
import ProjectDetailScreen from './src/screens/projects/ProjectDetailScreen'
import ProjectFormScreen from './src/screens/projects/ProjectFormScreen'
import TaskListScreen from './src/screens/tasks/TaskListScreen'
import TaskFormScreen from './src/screens/tasks/TaskFormScreen'
import ClientListScreen from './src/screens/clients/ClientListScreen'
import ClientFormScreen from './src/screens/clients/ClientFormScreen'
import UserListScreen from './src/screens/admin/UserListScreen'
import UserFormScreen from './src/screens/admin/UserFormScreen'
import AnalyticsScreen from './src/screens/admin/AnalyticsScreen'
import ReportScreen from './src/screens/admin/ReportScreen'
import SessionsScreen from './src/screens/admin/SessionsScreen'
import ChangeLogScreen from './src/screens/admin/ChangeLogScreen'

const Stack = createNativeStackNavigator()

function Navigation() {
  const { user, loadUser } = useAuth()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUser().finally(() => setLoading(false))
  }, [])

  if (loading) return null

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        <>
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="Projects" component={ProjectListScreen} />
          <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
          <Stack.Screen name="ProjectForm" component={ProjectFormScreen} />
          <Stack.Screen name="Tasks" component={TaskListScreen} />
          <Stack.Screen name="TaskForm" component={TaskFormScreen} />
          <Stack.Screen name="Clients" component={ClientListScreen} />
          <Stack.Screen name="ClientForm" component={ClientFormScreen} />
          <Stack.Screen name="Users" component={UserListScreen} />
          <Stack.Screen name="UserForm" component={UserFormScreen} />
          <Stack.Screen name="Analytics" component={AnalyticsScreen} />
          <Stack.Screen name="Report" component={ReportScreen} />
          <Stack.Screen name="Sessions" component={SessionsScreen} />
          <Stack.Screen name="ChangeLog" component={ChangeLogScreen} />
        </>
      )}
    </Stack.Navigator>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Navigation />
      </NavigationContainer>
    </AuthProvider>
  )
}