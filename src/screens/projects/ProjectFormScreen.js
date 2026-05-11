import { useEffect, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native'
import { Picker } from '@react-native-picker/picker'
import api from '../../api/axios'

export default function ProjectFormScreen({ route, navigation }) {
  const { id } = route.params
  const [form, setForm] = useState({
    name: '', description: '', startDate: '', endDate: '', status: 'active', clientId: ''
  })
  const [clients, setClients] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/clients').then(res => setClients(res.data))
    if (id) {
      api.get(`/projects/${id}`).then(res => {
        const p = res.data
        setForm({
          name: p.name,
          description: p.description || '',
          startDate: p.startDate.split('T')[0],
          endDate: p.endDate ? p.endDate.split('T')[0] : '',
          status: p.status,
          clientId: String(p.clientId)
        })
      })
    }
  }, [id])

  const handleSubmit = async () => {
    if (!form.name || !form.clientId || !form.startDate) {
      Alert.alert('Error', 'Nombre, cliente y fecha de inicio son requeridos')
      return
    }
    setError('')
    try {
      if (id) {
        await api.put(`/projects/${id}`, form)
      } else {
        await api.post('/projects', form)
      }
      navigation.goBack()
    } catch (error) {
      setError(error.response?.data?.message || 'Error al guardar proyecto')
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.navBack}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>{id ? 'Editar' : 'Nuevo'} Proyecto</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Text style={styles.label}>Nombre</Text>
          <TextInput style={styles.input} value={form.name}
            onChangeText={v => setForm({ ...form, name: v })} placeholder="Nombre del proyecto" />

          <Text style={styles.label}>Descripción</Text>
          <TextInput style={[styles.input, styles.textarea]} value={form.description}
            onChangeText={v => setForm({ ...form, description: v })}
            placeholder="Descripción" multiline numberOfLines={3} />

          <Text style={styles.label}>Fecha Inicio (YYYY-MM-DD)</Text>
          <TextInput style={styles.input} value={form.startDate}
            onChangeText={v => setForm({ ...form, startDate: v })} placeholder="2024-01-01" />

          <Text style={styles.label}>Fecha Fin (YYYY-MM-DD)</Text>
          <TextInput style={styles.input} value={form.endDate}
            onChangeText={v => setForm({ ...form, endDate: v })} placeholder="2024-12-31" />

          <Text style={styles.label}>Estado</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={form.status}
              onValueChange={v => setForm({ ...form, status: v })}>
              <Picker.Item label="Activo" value="active" />
              <Picker.Item label="Completado" value="completed" />
              <Picker.Item label="Pausado" value="paused" />
            </Picker>
          </View>

          <Text style={styles.label}>Cliente</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={form.clientId}
              onValueChange={v => setForm({ ...form, clientId: v })}>
              <Picker.Item label="Seleccionar cliente" value="" />
              {clients.map(c => <Picker.Item key={c.id} label={c.name} value={String(c.id)} />)}
            </Picker>
          </View>

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
  error: {
    color: '#dc2626', backgroundColor: '#fee2e2',
    padding: 10, borderRadius: 8, marginBottom: 12, fontSize: 13
  },
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