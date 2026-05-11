import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView } from 'react-native'
import api from '../../api/axios'

export default function ChangeLogScreen({ navigation }) {
  const [logs, setLogs] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    api.get('/changelog').then(res => setLogs(res.data))
  }, [])

  const actionColor = { CREATE: '#22c55e', UPDATE: '#eab308', DELETE: '#ef4444' }
  const entityLabel = { Client: 'Cliente', Project: 'Proyecto', Task: 'Tarea', User: 'Usuario' }

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.name}>{item.user?.name}</Text>
        <View style={[styles.badge, { backgroundColor: actionColor[item.action] + '20' }]}>
          <Text style={[styles.badgeText, { color: actionColor[item.action] }]}>
            {item.action}
          </Text>
        </View>
      </View>
      <Text style={styles.entity}>{entityLabel[item.entity] || item.entity} #{item.entityId}</Text>
      <Text style={styles.date}>{new Date(item.createdAt).toLocaleString()}</Text>
      <TouchableOpacity style={styles.detailBtn} onPress={() => setSelected(item)}>
        <Text style={styles.detailBtnText}>Ver detalle</Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.navBack}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Historial</Text>
        <View style={{ width: 60 }} />
      </View>

      <FlatList
        data={logs}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No hay cambios</Text>}
      />

      <Modal visible={!!selected} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Detalle del Cambio</Text>
            <ScrollView style={styles.modalScroll}>
              <Text style={styles.modalLabel}>ANTES</Text>
              <Text style={styles.modalCode}>
                {selected?.before ? JSON.stringify(selected.before, null, 2) : 'N/A'}
              </Text>
              <Text style={styles.modalLabel}>DESPUÉS</Text>
              <Text style={styles.modalCode}>
                {selected?.after ? JSON.stringify(selected.after, null, 2) : 'N/A'}
              </Text>
            </ScrollView>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setSelected(null)}>
              <Text style={styles.closeBtnText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  list: { padding: 16, gap: 12 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, elevation: 2, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  name: { fontSize: 15, fontWeight: 'bold', color: '#1f2937', flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: 'bold' },
  entity: { fontSize: 13, color: '#4b5563', marginBottom: 4 },
  date: { fontSize: 12, color: '#9ca3af', marginBottom: 8 },
  detailBtn: { backgroundColor: '#eff6ff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start' },
  detailBtnText: { color: '#2563eb', fontWeight: 'bold', fontSize: 13 },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: 40, fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 16 },
  modalCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, maxHeight: '80%' },
  modalTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 12 },
  modalScroll: { maxHeight: 300 },
  modalLabel: { fontSize: 11, fontWeight: 'bold', color: '#6b7280', marginBottom: 4, marginTop: 8 },
  modalCode: { backgroundColor: '#f9fafb', borderRadius: 8, padding: 10, fontSize: 11, color: '#374151', fontFamily: 'monospace' },
  closeBtn: { backgroundColor: '#2563eb', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 16 },
  closeBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 }
})