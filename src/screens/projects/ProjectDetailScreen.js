import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native'
import api from '../../api/axios'

const SCREEN_WIDTH = Dimensions.get('window').width - 64

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
  const taskStatusColor = { pending: '#6b7280', in_progress: '#3b82f6', completed: '#22c55e' }

  // Gantt logic
  const tasksWithDates = project.tasks?.filter(t => t.startDate && t.endDate) || []
  const ganttStart = project.startDate ? new Date(project.startDate) : null
  const ganttEnd = project.endDate ? new Date(project.endDate) : null
  const totalDays = ganttStart && ganttEnd
    ? Math.max((ganttEnd - ganttStart) / (1000 * 60 * 60 * 24), 1)
    : 0

  const getBarStyle = (task) => {
    const start = new Date(task.startDate)
    const end = new Date(task.endDate)
    const offsetDays = (start - ganttStart) / (1000 * 60 * 60 * 24)
    const durationDays = Math.max((end - start) / (1000 * 60 * 60 * 24), 1)
    const left = (offsetDays / totalDays) * SCREEN_WIDTH
    const width = Math.max((durationDays / totalDays) * SCREEN_WIDTH, 20)
    return { left: Math.max(left, 0), width: Math.min(width, SCREEN_WIDTH - left) }
  }

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

        {tasksWithDates.length > 0 && totalDays > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Diagrama Gantt</Text>
            <View style={styles.ganttDates}>
              <Text style={styles.ganttDateText}>{new Date(project.startDate).toLocaleDateString()}</Text>
              <Text style={styles.ganttDateText}>{new Date(project.endDate).toLocaleDateString()}</Text>
            </View>
            <View style={styles.ganttContainer}>
              {tasksWithDates.map(t => {
                const bar = getBarStyle(t)
                const color = taskStatusColor[t.status]
                return (
                  <View key={t.id} style={styles.ganttRow}>
                    <Text style={styles.ganttLabel} numberOfLines={1}>{t.title}</Text>
                    <View style={styles.ganttTrack}>
                      <View style={[styles.ganttBar, {
                        left: bar.left,
                        width: bar.width,
                        backgroundColor: color
                      }]} />
                    </View>
                  </View>
                )
              })}
            </View>
            <View style={styles.ganttLegend}>
              {[
                { label: 'Pendiente', color: '#6b7280' },
                { label: 'En progreso', color: '#3b82f6' },
                { label: 'Completado', color: '#22c55e' },
              ].map(l => (
                <View key={l.label} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: l.color }]} />
                  <Text style={styles.legendText}>{l.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

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
    backgroundColor: '#2563eb', paddingHorizontal: 16, paddingTop: 50,
    paddingBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
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
  // Gantt
  ganttDates: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  ganttDateText: { fontSize: 10, color: '#9ca3af' },
  ganttContainer: { gap: 8 },
  ganttRow: { marginBottom: 8 },
  ganttLabel: { fontSize: 11, color: '#4b5563', marginBottom: 4, fontWeight: '600' },
  ganttTrack: { height: 18, backgroundColor: '#f3f4f6', borderRadius: 4, position: 'relative' },
  ganttBar: { position: 'absolute', height: 18, borderRadius: 4, opacity: 0.85 },
  ganttLegend: { flexDirection: 'row', gap: 12, marginTop: 12, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11, color: '#6b7280' },
  // Tasks
  taskItem: { borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 12, marginTop: 8 },
  taskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  taskTitle: { fontSize: 14, fontWeight: '600', color: '#1f2937', flex: 1 },
  taskStatus: { fontSize: 12, color: '#6b7280', marginTop: 4 },
  empty: { textAlign: 'center', color: '#9ca3af', fontSize: 14 }
})