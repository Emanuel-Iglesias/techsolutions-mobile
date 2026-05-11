import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native'
import api from '../../api/axios'

export default function SessionsScreen({ navigation }) {
  const [sessions, setSessions] = useState([])

  useEffect(() => {
    api.get('/auth/sessions').then(res => setSessions(res.data))
  }, [])

  const roleLabel = { ADMIN: 'Administrador', EMPLOYEE: 'Empleado', CLIENT: 'Cliente' }
  const roleColor = { ADMIN: '#8b5cf6', EMPLOYEE: '#f97316', CLIENT: '#3b82f6' }

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.name}>{item.user?.name}</Text>
        <View style={[styles.badge, { backgroundColor: roleColor[item.user?.role] + '20' }]}>
          <Text style={[styles.badgeText, { color: roleColor[item.user?.role] }]}>
            {roleLabel[item.user?.role]}
          </Text>
        </View>
      </View>
      <Text style={styles.email}>{item.user?.email}</Text>
      <Text style={styles.date}>{new Date(item.loginAt).toLocaleString()}</Text>
      <Text style={styles.ip}>IP: {item.ip || '-'}</Text>
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.navBack}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Sesiones</Text>
        <View style={{ width: 60 }} />
      </View>
      <FlatList
        data={sessions}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No hay sesiones</Text>}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  navbar: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  navBack: { color: '#fff', fontSize: 14 },
  navTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  list: { padding: 16, gap: 12 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 2, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  name: { fontSize: 15, fontWeight: 'bold', color: '#1f2937', flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: 'bold' },
  email: { fontSize: 13, color: '#6b7280', marginBottom: 4 },
  date: { fontSize: 13, color: '#4b5563', marginBottom: 2 },
  ip: { fontSize: 12, color: '#9ca3af' },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40, fontSize: 15 }
})