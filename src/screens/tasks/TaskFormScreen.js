import { useEffect, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native'
import { Picker } from '@react-native-picker/picker'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

export default function TaskFormScreen({ route, navigation }) {
  const { id } = route.params
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'

  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'pending',
    projectId: '',
    userId: '',
    startDate: '',
    endDate: ''
  })
  const [projects, setProjects] = useState([])
  const [employees, setEmployees] = useState([])

  useEffect(() => {
    api.get('/projects').then(res => setProjects(res.data))
    if (isAdmin) api.get('/auth/employees').then(res => setEmployees(res.data))
    if (id) {
      api.get(`/tasks/${id}`).then(res => {
        const t = res.data
        setForm({
          title: t.title,
          description: t.description || '',
          priority: t.priority,
          status: t.status,
          projectId: String(t.projectId),
          userId: t.userId ? String(t.userId) : ''
        })
      })
    }
  }, [id])

  const handleSubmit = async () => {
    if (!form.title || !form.projectId) {
      Alert.alert('Error', 'Título y proyecto son requeridos')
      return
    }
    try {
      if (id) {
        await api.put(`/tasks/${id}`, form)
      } else {
        await api.post('/tasks', form)
      }
      navigation.goBack()
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Error al guardar tarea')
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.navBack}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>{id ? 'Editar' : 'Nueva'} Tarea</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>Título</Text>
          <TextInput style={styles.input} value={form.title}
            onChangeText={v => setForm({ ...form, title: v })} placeholder="Título de la tarea" />

          <Text style={styles.label}>Descripción</Text>
          <TextInput style={[styles.input, styles.textarea]} value={form.description}
            onChangeText={v => setForm({ ...form, description: v })}
            placeholder="Descripción" multiline numberOfLines={3} />

          <Text style={styles.label}>Proyecto</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={form.projectId}
              onValueChange={v => setForm({ ...form, projectId: v })}>
              <Picker.Item label="Seleccionar proyecto" value="" />
              {projects.map(p => <Picker.Item key={p.id} label={p.name} value={String(p.id)} />)}
            </Picker>
          </View>

          <Text style={styles.label}>Estado</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={form.status}
              onValueChange={v => setForm({ ...form, status: v })}>
              <Picker.Item label="Pendiente" value="pending" />
              <Picker.Item label="En progreso" value="in_progress" />
              <Picker.Item label="Completado" value="completed" />
            </Picker>
          </View>

          <Text style={styles.label}>Fecha Inicio (YYYY-MM-DD)</Text>
          <TextInput style={styles.input} value={form.startDate}
          onChangeText={v => setForm({ ...form, startDate: v })} placeholder="2024-01-01" />

          <Text style={styles.label}>Fecha Fin (YYYY-MM-DD)</Text>
          <TextInput style={styles.input} value={form.endDate}
          onChangeText={v => setForm({ ...form, endDate: v })} placeholder="2024-12-31" />

          {isAdmin && (
            <>
              <Text style={styles.label}>Prioridad</Text>
              <View style={styles.pickerContainer}>
                <Picker selectedValue={form.priority}
                  onValueChange={v => setForm({ ...form, priority: v })}>
                  <Picker.Item label="Alta" value="HIGH" />
                  <Picker.Item label="Media" value="MEDIUM" />
                  <Picker.Item label="Baja" value="LOW" />
                </Picker>
              </View>

              <Text style={styles.label}>Responsable</Text>
              <View style={styles.pickerContainer}>
                <Picker selectedValue={form.userId}
                  onValueChange={v => setForm({ ...form, userId: v })}>
                  <Picker.Item label="Sin asignar" value="" />
                  {employees.map(e => <Picker.Item key={e.id} label={e.name} value={String(e.id)} />)}
                </Picker>
              </View>
            </>
          )}

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>{id ? 'Actualizar' : 'Crear'}</Text>
          </TouchableOpacity>
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
  content: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 2 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14
  },
  textarea: { height: 80, textAlignVertical: 'top' },
  pickerContainer: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, overflow: 'hidden' },
  button: {
    backgroundColor: '#2563eb', borderRadius: 10,
    paddingVertical: 14, alignItems: 'center', marginTop: 20
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
})