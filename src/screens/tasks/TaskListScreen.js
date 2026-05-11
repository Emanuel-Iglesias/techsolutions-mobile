import { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

export default function TaskListScreen({ navigation }) {
  const [tasks, setTasks] = useState([])
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const isEmployee = user?.role === 'EMPLOYEE'

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks')
      setTasks(res.data)
    } catch {
      Alert.alert('Error', 'No se pudieron cargar las tareas')
    }
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchTasks)
    return unsubscribe
  }, [navigation])

  const priorityColor = { HIGH: '#ef4444', MEDIUM: '#eab308', LOW: '#22c55e' }
  const priorityLabel = { HIGH: 'Alta', MEDIUM: 'Media', LOW: 'Baja' }
  const statusColor = { pending: '#6b7280', in_progress: '#3b82f6', completed: '#22c55e' }
  const statusLabel = { pending: 'Pendiente', in_progress: 'En progreso', completed: 'Completado' }

  const handleDelete = async (id) => {
    Alert.alert('Confirmar', '¿Eliminar tarea?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive', onPress: async () => {
          await api.delete(`/tasks/${id}`)
          fetchTasks()
        }
      }
    ])
  }

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <View style={[styles.badge, { backgroundColor: priorityColor[item.priority] + '20' }]}>
          <Text style={[styles.badgeText, { color: priorityColor[item.priority] }]}>
            {priorityLabel[item.priority]}
          </Text>
        </View>
      </View>
      <Text style={styles.cardSub}>Proyecto: {item.project?.name}</Text>
      <Text style={styles.cardSub}>Responsable: {item.user?.name || 'Sin asignar'}</Text>
      <View style={[styles.statusBadge, { backgroundColor: statusColor[item.status] + '20' }]}>
        <Text style={[styles.badgeText, { color: statusColor[item.status] }]}>
          {statusLabel[item.status]}
        </Text>
      </View>
      <View style={styles.actions}>
        {(isAdmin || isEmployee) && (
          <TouchableOpacity style={styles.editBtn}
            onPress={() => navigation.navigate('TaskForm', { id: item.id })}>
            <Text style={styles.editBtnText}>Editar</Text>
          </TouchableOpacity>
        )}
        {isAdmin && (
          <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
            <Text style={styles.deleteBtnText}>Eliminar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.navBack}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>{isAdmin ? 'Tareas' : 'Mis Tareas'}</Text>
        {(isAdmin || isEmployee) && (
          <TouchableOpacity onPress={() => navigation.navigate('TaskForm', { id: null })}
            style={styles.addBtn}>
            <Text style={styles.addBtnText}>+ Nueva</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={tasks}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No hay tareas</Text>}
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
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start', marginTop: 8 },
  cardSub: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  editBtn: { backgroundColor: '#fef3c7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  editBtnText: { color: '#d97706', fontWeight: 'bold', fontSize: 13 },
  deleteBtn: { backgroundColor: '#fee2e2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  deleteBtnText: { color: '#dc2626', fontWeight: 'bold', fontSize: 13 },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40, fontSize: 15 }
})