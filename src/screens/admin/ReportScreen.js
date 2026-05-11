import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native'
import * as Print from 'expo-print'
import * as Sharing from 'expo-sharing'
import api from '../../api/axios'

export default function ReportScreen({ navigation }) {
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [clients, setClients] = useState([])
  const [users, setUsers] = useState([])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    api.get('/projects').then(res => setProjects(res.data))
    api.get('/tasks').then(res => setTasks(res.data))
    api.get('/clients').then(res => setClients(res.data))
    api.get('/auth/users').then(res => setUsers(res.data))
  }, [])

  const filteredProjects = projects.filter(p => {
    if (startDate && new Date(p.createdAt) < new Date(startDate)) return false
    if (endDate && new Date(p.createdAt) > new Date(endDate)) return false
    return true
  })

  const filteredTasks = tasks.filter(t => {
    if (startDate && new Date(t.createdAt) < new Date(startDate)) return false
    if (endDate && new Date(t.createdAt) > new Date(endDate)) return false
    return true
  })

  const statusLabel = { active: 'Activo', completed: 'Completado', paused: 'Pausado' }
  const statusColor = { active: '#22c55e', completed: '#3b82f6', paused: '#eab308' }

  const handleExportPDF = async () => {
    try {
      const projectRows = filteredProjects.map(p => {
        const projectTasks = tasks.filter(t => t.projectId === p.id)
        const completed = projectTasks.filter(t => t.status === 'completed').length
        const progress = projectTasks.length > 0 ? Math.round((completed / projectTasks.length) * 100) : 0
        return `<tr>
          <td>${p.name}</td>
          <td>${p.client?.name || '-'}</td>
          <td>${statusLabel[p.status]}</td>
          <td>${progress}%</td>
        </tr>`
      }).join('')

      const html = `
        <html>
        <head>
          <style>
            body { font-family: Arial; padding: 20px; }
            h1 { color: #2563eb; }
            h2 { color: #374151; margin-top: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background: #2563eb; color: white; padding: 8px; text-align: left; }
            td { padding: 8px; border-bottom: 1px solid #e5e7eb; }
            .summary { display: flex; gap: 10px; margin: 10px 0; }
            .card { background: #f3f4f6; padding: 10px; border-radius: 8px; text-align: center; flex: 1; }
            .card h3 { margin: 0; font-size: 24px; color: #2563eb; }
            .card p { margin: 4px 0 0; color: #6b7280; }
          </style>
        </head>
        <body>
          <h1>TechSolutions</h1>
          <p>Informe General — Generado: ${new Date().toLocaleString()}</p>
          ${startDate || endDate ? `<p>Período: ${startDate || 'inicio'} — ${endDate || 'hoy'}</p>` : ''}
          
          <h2>Resumen</h2>
          <div class="summary">
            <div class="card"><h3>${clients.length}</h3><p>Clientes</p></div>
            <div class="card"><h3>${filteredProjects.length}</h3><p>Proyectos</p></div>
            <div class="card"><h3>${filteredTasks.length}</h3><p>Tareas</p></div>
            <div class="card"><h3>${users.length}</h3><p>Usuarios</p></div>
          </div>

          <h2>Proyectos</h2>
          <table>
            <tr><th>Nombre</th><th>Cliente</th><th>Estado</th><th>Avance</th></tr>
            ${projectRows}
          </table>

          <h2>Estado de Tareas</h2>
          <table>
            <tr><th>Estado</th><th>Cantidad</th></tr>
            <tr><td>Pendientes</td><td>${filteredTasks.filter(t => t.status === 'pending').length}</td></tr>
            <tr><td>En Progreso</td><td>${filteredTasks.filter(t => t.status === 'in_progress').length}</td></tr>
            <tr><td>Completadas</td><td>${filteredTasks.filter(t => t.status === 'completed').length}</td></tr>
          </table>
        </body>
        </html>
      `

      const { uri } = await Print.printToFileAsync({ html })
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf' })
    } catch (error) {
      Alert.alert('Error', 'No se pudo generar el PDF')
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.navBack}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Informe General</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Filtro fechas */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Filtrar por Fecha</Text>
          <Text style={styles.label}>Desde (YYYY-MM-DD)</Text>
          <TextInput style={styles.input} value={startDate}
            onChangeText={setStartDate} placeholder="2024-01-01" />
          <Text style={styles.label}>Hasta (YYYY-MM-DD)</Text>
          <TextInput style={styles.input} value={endDate}
            onChangeText={setEndDate} placeholder="2024-12-31" />
          <View style={styles.filterActions}>
            <TouchableOpacity style={styles.clearBtn}
              onPress={() => { setStartDate(''); setEndDate('') }}>
              <Text style={styles.clearBtnText}>Limpiar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pdfBtn} onPress={handleExportPDF}>
              <Text style={styles.pdfBtnText}>📄 Exportar PDF</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Resumen */}
        <Text style={styles.sectionHeader}>Resumen</Text>
        <View style={styles.grid}>
          {[
            { label: 'Clientes', value: clients.length, color: '#3b82f6' },
            { label: 'Proyectos', value: filteredProjects.length, color: '#22c55e' },
            { label: 'Tareas', value: filteredTasks.length, color: '#eab308' },
            { label: 'Usuarios', value: users.length, color: '#8b5cf6' },
          ].map(item => (
            <View key={item.label} style={[styles.summaryCard, { backgroundColor: item.color }]}>
              <Text style={styles.summaryValue}>{item.value}</Text>
              <Text style={styles.summaryLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Tareas */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Estado de Tareas</Text>
          {[
            { label: 'Pendientes', value: filteredTasks.filter(t => t.status === 'pending').length, color: '#6b7280' },
            { label: 'En Progreso', value: filteredTasks.filter(t => t.status === 'in_progress').length, color: '#3b82f6' },
            { label: 'Completadas', value: filteredTasks.filter(t => t.status === 'completed').length, color: '#22c55e' },
          ].map(item => (
            <View key={item.label} style={styles.statRow}>
              <View style={[styles.dot, { backgroundColor: item.color }]} />
              <Text style={styles.statLabel}>{item.label}</Text>
              <Text style={styles.statValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* Proyectos */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Proyectos y Avance</Text>
          {filteredProjects.map(p => {
            const projectTasks = tasks.filter(t => t.projectId === p.id)
            const completed = projectTasks.filter(t => t.status === 'completed').length
            const progress = projectTasks.length > 0 ? Math.round((completed / projectTasks.length) * 100) : 0
            return (
              <View key={p.id} style={styles.projectItem}>
                <View style={styles.projectHeader}>
                  <Text style={styles.projectName} numberOfLines={1}>{p.name}</Text>
                  <View style={[styles.badge, { backgroundColor: statusColor[p.status] + '20' }]}>
                    <Text style={[styles.badgeText, { color: statusColor[p.status] }]}>
                      {statusLabel[p.status]}
                    </Text>
                  </View>
                </View>
                <Text style={styles.projectClient}>Cliente: {p.client?.name}</Text>
                <View style={styles.progressRow}>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, {
                      width: `${progress}%`,
                      backgroundColor: progress === 100 ? '#22c55e' : '#3b82f6'
                    }]} />
                  </View>
                  <Text style={styles.progressPct}>{progress}%</Text>
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
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 4, marginTop: 8 },
  input: {
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 8, fontSize: 14
  },
  filterActions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  clearBtn: { flex: 1, backgroundColor: '#f3f4f6', padding: 10, borderRadius: 8, alignItems: 'center' },
  clearBtnText: { color: '#4b5563', fontWeight: 'bold' },
  pdfBtn: { flex: 2, backgroundColor: '#6366f1', padding: 10, borderRadius: 8, alignItems: 'center' },
  pdfBtnText: { color: '#fff', fontWeight: 'bold' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  summaryCard: { width: '47%', borderRadius: 12, padding: 16, alignItems: 'center', elevation: 2 },
  summaryValue: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  summaryLabel: { fontSize: 13, color: '#fff', opacity: 0.9, marginTop: 4 },
  statRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  statLabel: { flex: 1, fontSize: 14, color: '#4b5563' },
  statValue: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
  projectItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  projectHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  projectName: { fontSize: 14, fontWeight: '600', color: '#1f2937', flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: 'bold' },
  projectClient: { fontSize: 12, color: '#6b7280', marginBottom: 8 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressTrack: { flex: 1, backgroundColor: '#e5e7eb', borderRadius: 10, height: 8 },
  progressFill: { height: 8, borderRadius: 10 },
  progressPct: { fontSize: 12, fontWeight: 'bold', color: '#1f2937', width: 35 },
  empty: { textAlign: 'center', color: '#9ca3af', fontSize: 14 }
})