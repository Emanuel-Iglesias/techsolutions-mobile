import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert     } from 'react-native'
import api from '../../api/axios'
import { Picker } from '@react-native-picker/picker'
import * as Print from 'expo-print'
import * as Sharing from 'expo-sharing'

export default function AnalyticsScreen({ navigation }) {
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [clients, setClients] = useState([])
  const [selectedProject, setSelectedProject] = useState('')

  useEffect(() => {
    api.get('/projects').then(res => setProjects(res.data))
    api.get('/tasks').then(res => setTasks(res.data))
    api.get('/clients').then(res => setClients(res.data))
  }, [])

  const filteredTasks = selectedProject ? tasks.filter(t => t.projectId === Number(selectedProject)) : tasks
  const filteredProjects = selectedProject ? projects.filter(p => p.id === Number(selectedProject)) : projects

  const pending = filteredTasks.filter(t => t.status === 'pending').length
  const inProgress = filteredTasks.filter(t => t.status === 'in_progress').length
  const completed = filteredTasks.filter(t => t.status === 'completed').length
  const high = filteredTasks.filter(t => t.priority === 'HIGH').length
  const medium = filteredTasks.filter(t => t.priority === 'MEDIUM').length
  const low = filteredTasks.filter(t => t.priority === 'LOW').length

  const StatCard = ({ label, value, color }) => (
    <View style={[styles.statCard, { backgroundColor: color }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )

  const ProgressBar = ({ label, value, total, color }) => {
    const pct = total > 0 ? Math.round((value / total) * 100) : 0
    return (
      <View style={styles.progressItem}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>{label}</Text>
          <Text style={styles.progressPct}>{value} ({pct}%)</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: color }]} />
        </View>
      </View>
    )
  }

  const handleExportPDF = async () => {
    try {
        const projectRows = filteredProjects.map(p => {
        const projectTasks = tasks.filter(t => t.projectId === p.id)
        const completed = projectTasks.filter(t => t.status === 'completed').length
        const progress = projectTasks.length > 0 ? Math.round((completed / projectTasks.length) * 100) : 0
        return `<tr><td>${p.name}</td><td>${progress}%</td><td>${projectTasks.length}</td><td>${completed}</td></tr>`
        }).join('')

        const html = `
        <html><head><style>
            body { font-family: Arial; padding: 20px; }
            h1 { color: #2563eb; } h2 { color: #374151; margin-top: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background: #2563eb; color: white; padding: 8px; text-align: left; }
            td { padding: 8px; border-bottom: 1px solid #e5e7eb; }
        </style></head>
        <body>
            <h1>TechSolutions — Analíticas</h1>
            <p>Generado: ${new Date().toLocaleString()}</p>
            ${selectedProject ? `<p>Proyecto: ${projects.find(p => p.id === Number(selectedProject))?.name}</p>` : ''}
            <h2>Resumen</h2>
            <table>
            <tr><th>Métrica</th><th>Valor</th></tr>
            <tr><td>Total Tareas</td><td>${filteredTasks.length}</td></tr>
            <tr><td>Pendientes</td><td>${filteredTasks.filter(t => t.status === 'pending').length}</td></tr>
            <tr><td>En Progreso</td><td>${filteredTasks.filter(t => t.status === 'in_progress').length}</td></tr>
            <tr><td>Completadas</td><td>${filteredTasks.filter(t => t.status === 'completed').length}</td></tr>
            <tr><td>Prioridad Alta</td><td>${filteredTasks.filter(t => t.priority === 'HIGH').length}</td></tr>
            <tr><td>Prioridad Media</td><td>${filteredTasks.filter(t => t.priority === 'MEDIUM').length}</td></tr>
            <tr><td>Prioridad Baja</td><td>${filteredTasks.filter(t => t.priority === 'LOW').length}</td></tr>
            </table>
            <h2>Avance por Proyecto</h2>
            <table>
            <tr><th>Proyecto</th><th>Avance</th><th>Total</th><th>Completadas</th></tr>
            ${projectRows}
            </table>
        </body></html>
        `
        const { uri } = await Print.printToFileAsync({ html })
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf' })
    } catch {
        Alert.alert('Error', 'No se pudo generar el PDF')
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.navBack}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Analíticas</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Filtro */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Filtrar por Proyecto</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={selectedProject}
              onValueChange={v => setSelectedProject(v)}>
              <Picker.Item label="Todos los proyectos" value="" />
              {projects.map(p => <Picker.Item key={p.id} label={p.name} value={String(p.id)} />)}
            </Picker>
          </View>
        </View>

        <TouchableOpacity style={styles.pdfBtn} onPress={handleExportPDF}>
            <Text style={styles.pdfBtnText}>📄 Exportar PDF</Text>
        </TouchableOpacity>

        {/* Resumen */}
        <Text style={styles.sectionHeader}>Resumen</Text>
        <View style={styles.grid}>
          <StatCard label="Clientes" value={clients.length} color="#3b82f6" />
          <StatCard label="Proyectos" value={filteredProjects.length} color="#22c55e" />
          <StatCard label="Tareas" value={filteredTasks.length} color="#eab308" />
          <StatCard label="Completadas" value={completed} color="#8b5cf6" />
        </View>

        {/* Tareas por estado */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Tareas por Estado</Text>
          <ProgressBar label="Pendientes" value={pending} total={filteredTasks.length} color="#6b7280" />
          <ProgressBar label="En Progreso" value={inProgress} total={filteredTasks.length} color="#3b82f6" />
          <ProgressBar label="Completadas" value={completed} total={filteredTasks.length} color="#22c55e" />
        </View>

        {/* Tareas por prioridad */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Tareas por Prioridad</Text>
          <ProgressBar label="Alta" value={high} total={filteredTasks.length} color="#ef4444" />
          <ProgressBar label="Media" value={medium} total={filteredTasks.length} color="#eab308" />
          <ProgressBar label="Baja" value={low} total={filteredTasks.length} color="#22c55e" />
        </View>

        {/* Avance por proyecto */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Avance por Proyecto</Text>
          {filteredProjects.map(p => {
            const projectTasks = tasks.filter(t => t.projectId === p.id)
            const completedTasks = projectTasks.filter(t => t.status === 'completed').length
            const progress = projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0
            return (
              <View key={p.id} style={styles.progressItem}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel} numberOfLines={1}>{p.name}</Text>
                  <Text style={styles.progressPct}>{progress}%</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, {
                    width: `${progress}%`,
                    backgroundColor: progress === 100 ? '#22c55e' : '#3b82f6'
                  }]} />
                </View>
              </View>
            )
          })}
          {filteredProjects.length === 0 && <Text style={styles.empty}>No hay proyectos</Text>}
        </View>
      </ScrollView>
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
  content: { padding: 16, gap: 12 },
  sectionHeader: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 2 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#1f2937', marginBottom: 12 },
  pickerContainer: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, overflow: 'hidden' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { width: '47%', borderRadius: 12, padding: 16, alignItems: 'center', elevation: 2 },
  statValue: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  statLabel: { fontSize: 13, color: '#fff', opacity: 0.9, marginTop: 4 },
  progressItem: { marginBottom: 12 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontSize: 13, color: '#4b5563', flex: 1 },
  progressPct: { fontSize: 13, fontWeight: 'bold', color: '#1f2937' },
  progressTrack: { backgroundColor: '#e5e7eb', borderRadius: 10, height: 8 },
  progressFill: { height: 8, borderRadius: 10 },
  empty: { textAlign: 'center', color: '#9ca3af', fontSize: 14 },
  pdfBtn: { backgroundColor: '#6366f1', padding: 10, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  pdfBtnText: { color: '#fff', fontWeight: 'bold' },
})