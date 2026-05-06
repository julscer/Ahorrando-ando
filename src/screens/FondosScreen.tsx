import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { ChevronLeft, Edit2, Trash2, Plus } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getUsuario, getFondos, addFondo, updateFondo, deleteFondo } from '../db/queries';

const CATEGORIAS_PERMITIDAS = ['viajes', 'salud', 'escuela', 'emergencia', 'Otro'];

export default function FondosScreen() {
  const navigation = useNavigation();
  const [fondos, setFondos] = useState<any[]>([]);
  const [userId, setUserId] = useState<number | null>(null);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Form State
  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState('Otro');

  const loadData = useCallback(() => {
    try {
      const user = getUsuario();
      if (user && user.id_usuario) {
        setUserId(user.id_usuario);
        const userFondos = getFondos(user.id_usuario);
        setFondos(userFondos || []);
      }
    } catch (e) {
      console.error("Error loading fondos", e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const totalFondos = fondos.reduce((sum, f) => sum + (f.meta || 0), 0);

  const openAddModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setMonto('');
    setCategoria('Otro');
    setModalVisible(true);
  };

  const openEditModal = (fondo: any) => {
    setIsEditing(true);
    setEditingId(fondo.id_fondo);
    setMonto(fondo.meta.toString());
    setCategoria(fondo.nombre_fondo);
    setModalVisible(true);
  };

  const handleDelete = (id_fondo: number) => {
    Alert.alert(
      "Eliminar Fondo",
      "¿Estás seguro de que deseas eliminar este fondo?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive",
          onPress: () => {
            try {
              deleteFondo(id_fondo);
              loadData();
            } catch (e) {
              console.error(e);
            }
          }
        }
      ]
    );
  };

  const handleSave = () => {
    if (!monto || isNaN(Number(monto)) || Number(monto) <= 0) {
      Alert.alert("Error", "Por favor ingresa un monto válido.");
      return;
    }

    if (!userId) return;

    try {
      if (isEditing && editingId) {
        updateFondo(editingId, categoria, Number(monto));
      } else {
        addFondo(userId, categoria, Number(monto));
      }
      setModalVisible(false);
      loadData();
    } catch (e) {
      console.error("Error saving fondo", e);
      Alert.alert("Error", "No se pudo guardar el fondo.");
    }
  };

  // Helper para capitalizar
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <View className="flex-1 bg-[#f8fafc]">
      {/* Header */}
      <View className="bg-white pt-14 pb-4 px-6 flex-row items-center border-b border-gray-100 shadow-sm">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <ChevronLeft color="#1f2937" size={28} />
        </TouchableOpacity>
        <Text className="text-gray-900 text-xl font-bold">Fondos</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6">
        {/* Tarjeta Mis fondos */}
        <View className="bg-[#a855f7] rounded-3xl p-6 mb-8 shadow-sm">
          <Text className="text-purple-100 text-base mb-1">Mis fondos</Text>
          <View className="flex-row items-end">
            <Text className="text-white text-4xl font-bold">${totalFondos.toFixed(2)}</Text>
            <Text className="text-white text-lg ml-2 mb-1">MXN</Text>
          </View>
        </View>

        {/* Distribución de fondos */}
        <Text className="text-gray-900 text-xl font-bold mb-4">Distribución de fondos</Text>

        {fondos.map((fondo) => (
          <View key={fondo.id_fondo} className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-gray-900 text-lg font-bold">{capitalize(fondo.nombre_fondo)}</Text>
              <View className="flex-row gap-3">
                <TouchableOpacity onPress={() => openEditModal(fondo)}>
                  <Edit2 color="#a855f7" size={20} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(fondo.id_fondo)}>
                  <Trash2 color="#ef4444" size={20} />
                </TouchableOpacity>
              </View>
            </View>
            <Text className="text-[#a855f7] text-2xl font-bold">${fondo.meta.toFixed(2)} MXN</Text>
          </View>
        ))}

        {/* Botón Agregar */}
        <TouchableOpacity 
          onPress={openAddModal}
          className="bg-purple-100 rounded-2xl p-4 flex-row justify-center items-center mt-2 mb-10"
        >
          <Plus color="#a855f7" size={20} className="mr-2" />
          <Text className="text-[#a855f7] text-lg font-semibold">Agregar nuevo fondo</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Modal Formulario */}
      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/50 px-6">
          <View className="bg-white w-full rounded-3xl p-6">
            <Text className="text-xl font-bold text-gray-900 mb-6">
              {isEditing ? 'Editar Fondo' : 'Nuevo Fondo'}
            </Text>

            <Text className="text-gray-600 mb-2 font-medium">Categoría</Text>
            <View className="flex-row flex-wrap gap-2 mb-6">
              {CATEGORIAS_PERMITIDAS.map(cat => (
                <TouchableOpacity 
                  key={cat}
                  onPress={() => setCategoria(cat)}
                  className={`px-4 py-2 rounded-full border ${categoria === cat ? 'bg-[#a855f7] border-[#a855f7]' : 'bg-white border-gray-300'}`}
                >
                  <Text className={categoria === cat ? 'text-white' : 'text-gray-700'}>
                    {capitalize(cat)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="text-gray-600 mb-2 font-medium">Monto (MXN)</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 mb-8 text-gray-900 text-lg"
              placeholder="0.00"
              keyboardType="numeric"
              value={monto}
              onChangeText={setMonto}
            />

            <View className="flex-row gap-4">
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                className="flex-1 bg-gray-100 rounded-xl py-3 items-center"
              >
                <Text className="text-gray-700 font-semibold text-lg">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleSave}
                className="flex-1 bg-[#a855f7] rounded-xl py-3 items-center"
              >
                <Text className="text-white font-semibold text-lg">Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}
