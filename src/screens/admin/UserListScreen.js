import { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native'
import api from '../../api/axios'

export default function UserListScreen({ navigation }) {
  const [users, setUsers] = useState([])

  const fetchUsers = async () => {
    try {
      const res = await api.get('/auth/users')
      setUsers(res.data)
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los usuarios')
    }
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchUsers)
    return unsubscribe
  }, [navigation])

  const roleLabel = { ADMIN: 'Administrador', EMPLOYEE: 'Empleado', CLIENT: 'Cliente' }
  const roleColor = { ADMIN: '#8b5cf6', EMPLOYEE: '#f97316', CLIENT: '#3b82f6' }

  const handleDelete = async (id) => {
    Alert.alert('Confirmar', '¿Eliminar usuario?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive', onPress: async () => {
          await api.delete(`/auth/users/${id}`)
          fetchUsers()
        }
      }
    ])
  }

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <View style={[styles.badge, { backgroundColor: roleColor[item.role] + '20' }]}>
          <Text style={[styles.badgeText, { color: roleColor[item.role] }]}>
            {roleLabel[item.role]}
          </Text>
        </View>
      </View>
      <Text style={styles.cardSub}>{item.email}</Text>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
          <Text style={styles.deleteBtnText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.navBack}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Usuarios</Text>
        <TouchableOpacity onPress={() => navigation.navigate('UserForm', { id: null })}
          style={styles.addBtn}>
          <Text style={styles.addBtnText}>+ Nuevo</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={users}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No hay usuarios</Text>}
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
  addBtn: { backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  addBtnText: { color: '#2563eb', fontWeight: 'bold', fontSize: 13 },
  list: { padding: 16, gap: 12 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 2, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: 'bold' },
  cardSub: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  deleteBtn: { backgroundColor: '#fee2e2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  deleteBtnText: { color: '#dc2626', fontWeight: 'bold', fontSize: 13 },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40, fontSize: 15 }
})