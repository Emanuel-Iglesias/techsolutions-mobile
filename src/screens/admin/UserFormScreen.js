import { useEffect, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native'
import { Picker } from '@react-native-picker/picker'
import api from '../../api/axios'

export default function UserFormScreen({ route, navigation }) {
  const { id } = route.params
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'CLIENT', clientId: '' })
  const [availableClients, setAvailableClients] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/clients/available').then(res => setAvailableClients(res.data)).catch(() => {})
    if (id) {
      api.get('/auth/users').then(res => {
        const user = res.data.find(u => u.id === id)
        if (user) setForm({ name: user.name, email: user.email, password: '', role: user.role, clientId: '' })
      })
    }
  }, [id])

  const handleSubmit = async () => {
    if (!form.name || !form.email || (!id && !form.password)) {
      Alert.alert('Error', 'Completa todos los campos requeridos')
      return
    }
    setError('')
    try {
      if (id) {
        await api.put(`/auth/users/${id}`, form)
      } else {
        await api.post('/auth/register', { ...form, clientId: form.clientId ? Number(form.clientId) : null })
      }
      navigation.goBack()
    } catch (error) {
      setError(error.response?.data?.message || 'Error al guardar usuario')
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.navBack}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>{id ? 'Editar' : 'Nuevo'} Usuario</Text>
        <View style={{ width: 60 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Text style={styles.label}>Nombre</Text>
          <TextInput style={styles.input} value={form.name}
            onChangeText={v => setForm({ ...form, name: v })} placeholder="Nombre" />

          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} value={form.email}
            onChangeText={v => setForm({ ...form, email: v })}
            placeholder="Email" keyboardType="email-address" autoCapitalize="none" />

          <Text style={styles.label}>{id ? 'Nueva Contraseña (opcional)' : 'Contraseña'}</Text>
          <TextInput style={styles.input} value={form.password}
            onChangeText={v => setForm({ ...form, password: v })}
            placeholder="Contraseña" secureTextEntry />

          <Text style={styles.label}>Rol</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={form.role}
              onValueChange={v => setForm({ ...form, role: v })}>
              <Picker.Item label="Cliente" value="CLIENT" />
              <Picker.Item label="Empleado" value="EMPLOYEE" />
              <Picker.Item label="Administrador" value="ADMIN" />
            </Picker>
          </View>

          {form.role === 'CLIENT' && !id && (
            <>
              <Text style={styles.label}>Asociar a Cliente</Text>
              <View style={styles.pickerContainer}>
                <Picker selectedValue={form.clientId}
                  onValueChange={v => setForm({ ...form, clientId: v })}>
                  <Picker.Item label="Seleccionar cliente" value="" />
                  {availableClients.map(c => (
                    <Picker.Item key={c.id} label={`${c.name} — ${c.email}`} value={String(c.id)} />
                  ))}
                </Picker>
              </View>
              {availableClients.length === 0 && (
                <Text style={styles.warning}>No hay clientes sin usuario asignado</Text>
              )}
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
  error: {
    color: '#dc2626', backgroundColor: '#fee2e2',
    padding: 10, borderRadius: 8, marginBottom: 12, fontSize: 13
  },
  warning: { color: '#dc2626', fontSize: 12, marginTop: 4 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14
  },
  pickerContainer: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, overflow: 'hidden' },
  button: {
    backgroundColor: '#2563eb', borderRadius: 10,
    paddingVertical: 14, alignItems: 'center', marginTop: 20
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
})