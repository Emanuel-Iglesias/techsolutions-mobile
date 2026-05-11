import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import api from '../../api/axios'

export default function ProjectDetailScreen({ route, navigation }) {
  const [project, setProject] = useState(null)
  const { id } = route.params

  useEffect(() => {
    api.get(`/projects/${id}`).then(res => setProject(res.data))
  }, [id])

  if (!project) return (
    <View style={styles.loading}>
      <Text>Cargando...</Text>
    </View>
  )

  const totalTasks = project.tasks?.length || 0
  const completedTasks = project.tasks?.filter(t => t.status === 'completed').length || 0
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const statusLabel = { active: 'Activo', completed: 'Completado', paused: 'Pausado' }
  const statusColor = { active: '#22c55e', completed: '#3b82f6', paused: '#eab308' }
  const priorityLabel = { HIGH: 'Alta', MEDIUM: 'Media', LOW: 'Baja' }
  const priorityColor = { HIGH: '#ef4444', MEDIUM: '#eab308', LOW: '#22c55e' }
  const taskStatusLabel = { pending: 'Pendiente', in_progress: 'En progreso', completed: 'Completado' }

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <Text style={styles.navBack} onPress={() => navigation.goBack()}>← Volver</Text>
        <Text style={styles.navTitle}>Detalle</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.projectTitle}>{project.name}</Text>
            <View style={[styles.badge, { backgroundColor: statusColor[project.status] + '20' }]}>
              <Text style={[styles.badgeText, { color: statusColor[project.status] }]}>
                {statusLabel[project.status]}
              </Text>
            </View>
          </View>
          {project.description && <Text style={styles.description}>{project.description}</Text>}
          <Text style={styles.info}>Cliente: {project.client?.name}</Text>
          <Text style={styles.info}>Inicio: {new Date(project.startDate).toLocaleDateString()}</Text>
          <Text style={styles.info}>Fin: {project.endDate ? new Date(project.endDate).toLocaleDateString() : '-'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Avance del Proyecto</Text>
          <View style={styles.progressRow}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, {
                width: `${progress}%`,
                backgroundColor: progress === 100 ? '#22c55e' : progress > 50 ? '#3b82f6' : '#eab308'
              }]} />
            </View>
            <Text style={styles.progressText}>{progress}%</Text>
          </View>
          <Text style={styles.progressSub}>{completedTasks} de {totalTasks} tareas completadas</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Tareas</Text>
          {project.tasks?.length === 0 && <Text style={styles.empty}>No hay tareas</Text>}
          {project.tasks?.map(t => (
            <View key={t.id} style={styles.taskItem}>
              <View style={styles.taskHeader}>
                <Text style={styles.taskTitle}>{t.title}</Text>
                <View style={[styles.badge, { backgroundColor: priorityColor[t.priority] + '20' }]}>
                  <Text style={[styles.badgeText, { color: priorityColor[t.priority] }]}>
                    {priorityLabel[t.priority]}
                  </Text>
                </View>
              </View>
              <Text style={styles.taskStatus}>{taskStatusLabel[t.status]}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
  content: { padding: 16, gap: 12 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 2, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  projectTitle: { fontSize: 20, fontWeight: 'bold', color: '#1f2937', flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: 'bold' },
  description: { fontSize: 14, color: '#6b7280', marginBottom: 8 },
  info: { fontSize: 14, color: '#4b5563', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 12 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressBar: { flex: 1, backgroundColor: '#e5e7eb', borderRadius: 10, height: 10 },
  progressFill: { height: 10, borderRadius: 10 },
  progressText: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
  progressSub: { fontSize: 13, color: '#6b7280', marginTop: 6 },
  taskItem: { borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 12, marginTop: 8 },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  taskTitle: { fontSize: 14, fontWeight: '600', color: '#1f2937', flex: 1 },
  taskStatus: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  empty: { textAlign: 'center', color: '#9ca3af', fontSize: 14 }
})