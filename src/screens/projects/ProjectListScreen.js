import { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, RefreshControl } from 'react-native'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

export default function ProjectListScreen({ navigation }) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const res = await api.get('/projects')
      setProjects(res.data)
    } catch {
      Alert.alert('Error', 'No se pudieron cargar los proyectos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchProjects)
    return unsubscribe
  }, [navigation])

  const statusLabel = { active: 'Activo', completed: 'Completado', paused: 'Pausado' }
  const statusColor = { active: '#22c55e', completed: '#3b82f6', paused: '#eab308' }

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => navigation.navigate('ProjectDetail', { id: item.id })}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <View style={[styles.badge, { backgroundColor: statusColor[item.status] + '20' }]}>
            <Text style={[styles.badgeText, { color: statusColor[item.status] }]}>
              {statusLabel[item.status]}
            </Text>
          </View>
        </View>
        <Text style={styles.cardSub}>Cliente: {item.client?.name}</Text>
        <Text style={styles.cardSub}>Inicio: {new Date(item.startDate).toLocaleDateString()}</Text>
      </TouchableOpacity>
      {isAdmin && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.editBtn}
            onPress={() => navigation.navigate('ProjectForm', { id: item.id })}>
            <Text style={styles.editBtnText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn}
            onPress={() => {
              Alert.alert('Confirmar', '¿Eliminar proyecto?', [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Eliminar', style: 'destructive', onPress: async () => {
                    await api.delete(`/projects/${item.id}`)
                    fetchProjects()
                  }
                }
              ])
            }}>
            <Text style={styles.deleteBtnText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.navBack}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>{isAdmin ? 'Proyectos' : 'Mis Proyectos'}</Text>
        {isAdmin && (
          <TouchableOpacity onPress={() => navigation.navigate('ProjectForm', { id: null })}
            style={styles.addBtn}>
            <Text style={styles.addBtnText}>+ Nuevo</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={projects}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No hay proyectos</Text>}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchProjects} colors={['#2563eb']} />}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  navbar: {
    backgroundColor: '#2563eb', paddingHorizontal: 16, paddingTop: 50,
    paddingBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
  },
  navBack: { color: '#fff', fontSize: 14 },
  navTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  addBtn: { backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  addBtnText: { color: '#2563eb', fontWeight: 'bold', fontSize: 13 },
  list: { padding: 16, gap: 12 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: 'bold' },
  cardSub: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40, fontSize: 15 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  editBtn: { backgroundColor: '#fef3c7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  editBtnText: { color: '#d97706', fontWeight: 'bold', fontSize: 13 },
  deleteBtn: { backgroundColor: '#fee2e2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  deleteBtnText: { color: '#dc2626', fontWeight: 'bold', fontSize: 13 },
})