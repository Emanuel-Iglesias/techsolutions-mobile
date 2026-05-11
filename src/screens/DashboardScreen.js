import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { useAuth } from '../context/AuthContext'

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  const adminCards = [
    { label: 'Usuarios', screen: 'Users', color: '#8b5cf6', icon: '👤' },
    { label: 'Clientes', screen: 'Clients', color: '#3b82f6', icon: '👥' },
    { label: 'Proyectos', screen: 'Projects', color: '#22c55e', icon: '📁' },
    { label: 'Tareas', screen: 'Tasks', color: '#eab308', icon: '✅' },
  ]

  const employeeCards = [
    { label: 'Mis Tareas', screen: 'Tasks', color: '#eab308', icon: '✅' },
    { label: 'Proyectos', screen: 'Projects', color: '#22c55e', icon: '📁' },
  ]

  const clientCards = [
    { label: 'Mis Proyectos', screen: 'Projects', color: '#22c55e', icon: '📁' },
    { label: 'Mis Tareas', screen: 'Tasks', color: '#eab308', icon: '✅' },
  ]

  const cards = user?.role === 'ADMIN' ? adminCards : user?.role === 'EMPLOYEE' ? employeeCards : clientCards
  const roleLabel = { ADMIN: 'Administrador', EMPLOYEE: 'Empleado', CLIENT: 'Cliente' }

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <Text style={styles.navTitle}>TechSolutions</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.welcome}>Hola, {user?.name}</Text>
        <Text style={styles.role}>{roleLabel[user?.role]}</Text>

        <View style={styles.grid}>
          {cards.map(card => (
            <TouchableOpacity
              key={card.screen}
              style={[styles.card, { backgroundColor: card.color }]}
              onPress={() => navigation.navigate(card.screen)}>
              <Text style={styles.cardIcon}>{card.icon}</Text>
              <Text style={styles.cardLabel}>{card.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  navbar: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  navTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  logoutBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  logoutText: { color: '#2563eb', fontWeight: 'bold', fontSize: 13 },
  content: { padding: 20 },
  welcome: { fontSize: 22, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 },
  role: { fontSize: 14, color: '#6b7280', marginBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    width: '47%',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    elevation: 3
  },
  cardIcon: { fontSize: 36, marginBottom: 8 },
  cardLabel: { color: '#fff', fontWeight: 'bold', fontSize: 16, textAlign: 'center' }
})