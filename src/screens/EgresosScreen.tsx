import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { ChevronLeft, Edit2, Trash2, Plus, Minus } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  getUsuario,
  getGastosFijos,
  getGastosVariablesPorMesEgresos,
  addGastoFijo,
  addGastoVariable,
  updateGasto,
  deleteGasto,
} from '../db/queries';

export default function EgresosScreen() {
  const navigation = useNavigation();
  const [userId, setUserId] = useState<number | null>(null);
  const [gastosFijos, setGastosFijos] = useState<any[]>([]);
  const [gastosVariables, setGastosVariables] = useState<any[]>([]);

  // Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTipo, setModalTipo] = useState<'fijo' | 'variable'>('fijo');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [concepto, setConcepto] = useState('');
  const [monto, setMonto] = useState('');

  const loadData = useCallback(() => {
    try {
      const user = getUsuario();
      if (user) {
        setUserId(user.id_usuario);
        setGastosFijos(getGastosFijos(user.id_usuario));
        setGastosVariables(getGastosVariablesPorMesEgresos(user.id_usuario));
      }
    } catch (e) {
      console.error('Error loading egresos', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const sumaFijos = gastosFijos.reduce((s, g) => s + (g.monto || 0), 0);
  const sumaVariables = gastosVariables.reduce((s, g) => s + (g.monto || 0), 0);
  const totalEgresos = sumaFijos + sumaVariables;

  // --- Modal handlers ---
  const openAddModal = (tipo: 'fijo' | 'variable') => {
    setModalTipo(tipo);
    setIsEditing(false);
    setEditingId(null);
    setConcepto('');
    setMonto('');
    setModalVisible(true);
  };

  const openEditModal = (gasto: any, tipo: 'fijo' | 'variable') => {
    setModalTipo(tipo);
    setIsEditing(true);
    setEditingId(gasto.id_gasto);
    setConcepto(gasto.descripcion || '');
    setMonto(gasto.monto.toString());
    setModalVisible(true);
  };

  const handleDelete = (id_gasto: number) => {
    Alert.alert('Eliminar Gasto', '¿Estás seguro de que deseas eliminar este gasto?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          try {
            deleteGasto(id_gasto);
            loadData();
          } catch (e) {
            console.error(e);
          }
        },
      },
    ]);
  };

  const handleSave = () => {
    if (!concepto.trim()) {
      Alert.alert('Error', 'Por favor ingresa un concepto.');
      return;
    }
    if (!monto || isNaN(Number(monto)) || Number(monto) <= 0) {
      Alert.alert('Error', 'Por favor ingresa un monto válido.');
      return;
    }
    if (!userId) return;

    try {
      if (isEditing && editingId) {
        updateGasto(editingId, Number(monto), concepto.trim());
      } else {
        if (modalTipo === 'fijo') {
          addGastoFijo(userId, Number(monto), concepto.trim());
        } else {
          addGastoVariable(userId, Number(monto), concepto.trim());
        }
      }
      setModalVisible(false);
      loadData();
    } catch (e) {
      console.error('Error saving gasto', e);
      Alert.alert('Error', 'No se pudo guardar el gasto.');
    }
  };

  // --- Render helpers ---
  const renderGastoCard = (gasto: any, tipo: 'fijo' | 'variable') => (
    <View key={gasto.id_gasto} className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
      <View className="flex-row items-center mb-3">
        <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${tipo === 'fijo' ? 'bg-orange-100' : 'bg-pink-100'}`}>
          <Minus color={tipo === 'fijo' ? '#f97316' : '#ec4899'} size={20} />
        </View>
        <Text className="text-gray-900 text-lg font-bold flex-1">{gasto.descripcion}</Text>
        <TouchableOpacity onPress={() => openEditModal(gasto, tipo)} className="mr-3">
          <Edit2 color={tipo === 'fijo' ? '#f97316' : '#ec4899'} size={20} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(gasto.id_gasto)}>
          <Trash2 color="#ef4444" size={20} />
        </TouchableOpacity>
      </View>
      <Text className={`text-2xl font-bold ${tipo === 'fijo' ? 'text-[#f97316]' : 'text-[#ec4899]'}`}>
        ${gasto.monto.toFixed(2)} MXN
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-[#fef7f4]">
      {/* Header Rojo */}
      <View className="bg-[#ef4444] pt-14 pb-10 px-6 rounded-b-[40px]">
        <TouchableOpacity onPress={() => navigation.goBack()} className="flex-row items-center mb-4">
          <ChevronLeft color="#ffffff" size={24} />
          <Text className="text-white text-base ml-1">Volver</Text>
        </TouchableOpacity>
        <Text className="text-white text-3xl font-bold">Mis Egresos</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6">

        {/* === GASTOS FIJOS === */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-gray-900 text-xl font-bold">Gastos Fijos Mensuales</Text>
          <View className="bg-orange-50 px-3 py-1 rounded-full">
            <Text className="text-[#f97316] font-bold">${sumaFijos.toFixed(2)}</Text>
          </View>
        </View>

        {gastosFijos.map((g) => renderGastoCard(g, 'fijo'))}

        <TouchableOpacity
          onPress={() => openAddModal('fijo')}
          className="bg-orange-50 rounded-2xl p-4 flex-row justify-center items-center mb-6"
        >
          <Plus color="#f97316" size={20} />
          <Text className="text-[#f97316] text-lg font-semibold ml-2">Agregar gasto fijo</Text>
        </TouchableOpacity>

        {/* Separador */}
        <View className="border-b border-gray-200 mb-6" />

        {/* === GASTOS VARIABLES === */}
        <View className="flex-row justify-between items-center mb-1">
          <Text className="text-gray-900 text-xl font-bold">Gastos Variables (Gustitos)</Text>
          <View className="bg-pink-50 px-3 py-1 rounded-full">
            <Text className="text-[#ec4899] font-bold">${sumaVariables.toFixed(2)}</Text>
          </View>
        </View>
        <Text className="text-gray-400 text-sm mb-4">Aquí lo que no es esencial</Text>

        {gastosVariables.map((g) => renderGastoCard(g, 'variable'))}

        <TouchableOpacity
          onPress={() => openAddModal('variable')}
          className="bg-pink-50 rounded-2xl p-4 flex-row justify-center items-center mb-6"
        >
          <Plus color="#ec4899" size={20} />
          <Text className="text-[#ec4899] text-lg font-semibold ml-2">Agregar gustito</Text>
        </TouchableOpacity>

        {/* === TARJETA RESUMEN === */}
        <View className="bg-[#ef4444] rounded-3xl p-6 mb-10">
          <Text className="text-red-100 text-base mb-1">Estás gastando:</Text>
          <View className="flex-row items-end mb-4">
            <Text className="text-white text-4xl font-bold">${totalEgresos.toFixed(2)}</Text>
            <Text className="text-white text-lg ml-2 mb-1">MXN</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-red-100">Gastos fijos:</Text>
            <Text className="text-white font-bold">${sumaFijos.toFixed(2)}</Text>
          </View>
          <View className="flex-row justify-between mt-1">
            <Text className="text-red-100">Gastos variables:</Text>
            <Text className="text-white font-bold">${sumaVariables.toFixed(2)}</Text>
          </View>
        </View>

      </ScrollView>

      {/* Modal */}
      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/50 px-6">
          <View className="bg-white w-full rounded-3xl p-6">
            <Text className="text-xl font-bold text-gray-900 mb-6">
              {isEditing ? 'Editar Gasto' : modalTipo === 'fijo' ? 'Nuevo Gasto Fijo' : 'Nuevo Gustito'}
            </Text>

            <Text className="text-gray-600 mb-2 font-medium">Concepto</Text>
            <TextInput
              className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 mb-4 text-gray-900 text-lg"
              placeholder="Ej: Gasolina, Comida..."
              value={concepto}
              onChangeText={setConcepto}
            />

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
                className="flex-1 bg-[#ef4444] rounded-xl py-3 items-center"
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
