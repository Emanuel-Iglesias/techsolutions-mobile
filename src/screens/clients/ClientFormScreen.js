import { useEffect, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native'
import { Picker } from '@react-native-picker/picker'
import api from '../../api/axios'

export default function ClientFormScreen({ route, navigation }) {
  const { id } = route.params
  const [form, setForm] = useState({
    name: '', email: '', phone: '', company: '', status: 'active'
  })
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) {
      api.get(`/clients/${id}`).then(res => setForm(res.data))
    }
  }, [id])

  const handleSubmit = async () => {
    if (!form.name || !form.email) {
      Alert.alert('Error', 'Nombre y email son requeridos')
      return
    }
    setError('')
    try {
      if (id) {
        await api.put(`/clients/${id}`, form)
      } else {
        await api.post('/clients', form)
      }
      navigation.goBack()
    } catch (error) {
      setError(error.response?.data?.message || 'Error al guardar cliente')
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.navBack}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>{id ? 'Editar' : 'Nuevo'} Cliente</Text>
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

          <Text style={styles.label}>Teléfono</Text>
          <TextInput style={styles.input} value={form.phone}
            onChangeText={v => setForm({ ...form, phone: v })}
            placeholder="Teléfono" keyboardType="phone-pad" />

          <Text style={styles.label}>Empresa</Text>
          <TextInput style={styles.input} value={form.company}
            onChangeText={v => setForm({ ...form, company: v })} placeholder="Empresa" />

          <Text style={styles.label}>Estado</Text>
          <View style={styles.pickerContainer}>
            <Picker selectedValue={form.status}
              onValueChange={v => setForm({ ...form, status: v })}>
              <Picker.Item label="Activo" value="active" />
              <Picker.Item label="Inactivo" value="inactive" />
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
  pickerContainer: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, overflow: 'hidden' },
  button: {
    backgroundColor: '#2563eb', borderRadius: 10,
    paddingVertical: 14, alignItems: 'center', marginTop: 20
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
})