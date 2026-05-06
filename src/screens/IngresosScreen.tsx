import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ArrowLeft, Pencil, Trash2, Plus } from 'lucide-react-native';
import { 
  getUsuario, 
  getIngresosFijosPorMes, 
  getIngresosVariablesPorMes, 
  getTotalesMes, 
  setIngresoFijo, 
  addIngresoVariable, 
  deleteIngreso 
} from '../db/queries';

export default function IngresosScreen() {
  const navigation = useNavigation();
  
  // State
  const [userId, setUserId] = useState<number | null>(null);
  const [fijoAmount, setFijoAmount] = useState<string>('');
  const [variables, setVariables] = useState<any[]>([]);
  const [totales, setTotales] = useState({ sumaFijos: 0, sumaVariables: 0, totalMes: 0 });
  
  // Modal State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newVarName, setNewVarName] = useState('');
  const [newVarAmount, setNewVarAmount] = useState('');

  const loadData = useCallback(() => {
    try {
      const user = getUsuario();
      if (user) {
        setUserId(user.id_usuario);
        
        const fijos = getIngresosFijosPorMes();
        if (fijos.length > 0) {
          setFijoAmount(fijos[0].monto.toString());
        } else {
          setFijoAmount('');
        }
        
        const vars = getIngresosVariablesPorMes();
        setVariables(vars);
        
        const totals = getTotalesMes();
        setTotales(totals);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleSaveFijo = () => {
    if (!userId) return;
    const val = parseFloat(fijoAmount);
    if (isNaN(val) || val < 0) return;
    setIngresoFijo(userId, val);
    loadData();
  };

  const handleAddVariable = () => {
    if (!userId) return;
    const val = parseFloat(newVarAmount);
    if (isNaN(val) || val <= 0 || !newVarName.trim()) {
      Alert.alert('Error', 'Ingresa un nombre y una cantidad válida.');
      return;
    }
    
    addIngresoVariable(userId, val, newVarName.trim());
    setIsModalVisible(false);
    setNewVarName('');
    setNewVarAmount('');
    loadData();
  };

  const handleDeleteVariable = (id: number) => {
    Alert.alert('Eliminar', '¿Estás seguro de eliminar este ingreso variable?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => {
        deleteIngreso(id);
        loadData();
      }}
    ]);
  };

  return (
    <View className="flex-1 bg-[#f0fdf4]">
      {/* Top Header */}
      <View className="bg-green-500 pt-16 pb-8 px-6">
        <TouchableOpacity 
          className="flex-row items-center mb-6" 
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft color="#ffffff" size={24} />
          <Text className="text-white text-lg font-medium ml-2">Volver</Text>
        </TouchableOpacity>
        <Text className="text-white text-4xl font-bold">Mis Ingresos</Text>
      </View>

      <ScrollView className="flex-1 px-5 pt-6" contentContainerStyle={{ paddingBottom: 60 }}>
        
        {/* Fijos */}
        <Text className="text-2xl font-bold text-gray-800 mb-4">Ingresos Fijos</Text>
        <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-8">
          <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 mb-3">
            <Text className="text-gray-500 text-lg mr-2">$</Text>
            <TextInput 
              className="flex-1 text-2xl font-medium text-gray-900"
              keyboardType="numeric"
              placeholder="0.00"
              value={fijoAmount}
              onChangeText={setFijoAmount}
              onEndEditing={handleSaveFijo}
            />
            <Text className="text-gray-400 text-lg ml-2">MXN</Text>
          </View>
          <Text className="text-gray-500 text-sm italic">
            Este dinero es el que mensualmente estarás teniendo
          </Text>
        </View>

        {/* Variables */}
        <Text className="text-2xl font-bold text-gray-800 mb-4">Ingresos Variables</Text>
        
        {variables.map((item) => (
          <View key={item.id_ingreso} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4 flex-row justify-between items-center">
            <View>
              <Text className="text-gray-800 text-lg font-bold mb-1">{item.descripcion}</Text>
              <Text className="text-green-600 text-xl font-semibold">${item.monto.toFixed(2)} MXN</Text>
            </View>
            <View className="flex-row">
              {/* Optional: Add edit logic if needed, skipping to match prompt simply, mostly using delete */}
              <TouchableOpacity className="p-2 mr-2">
                <Pencil color="#16a34a" size={20} />
              </TouchableOpacity>
              <TouchableOpacity className="p-2" onPress={() => handleDeleteVariable(item.id_ingreso)}>
                <Trash2 color="#ef4444" size={20} />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Add Button */}
        <TouchableOpacity 
          className="bg-green-100 py-4 rounded-xl flex-row justify-center items-center mb-10"
          onPress={() => setIsModalVisible(true)}
        >
          <Plus color="#16a34a" size={20} className="mr-2" />
          <Text className="text-green-700 text-lg font-bold">Agregar ingreso variable</Text>
        </TouchableOpacity>

        {/* Total Month Card */}
        <View className="bg-green-500 p-6 rounded-2xl shadow-sm mb-10">
          <View className="flex-row items-center mb-4">
            <View className="bg-green-400/50 w-10 h-10 rounded-full items-center justify-center mr-3">
              <Text className="text-white text-xl font-bold">$</Text>
            </View>
            <Text className="text-white text-sm font-medium">Ingreso Total</Text>
          </View>
          
          <View className="flex-row items-end mb-6 border-b border-green-400/50 pb-4">
            <Text className="text-white text-5xl font-bold">${totales.totalMes.toFixed(2)}</Text>
            <Text className="text-white text-lg ml-2 mb-1">MXN</Text>
          </View>

          <View className="flex-row justify-between mb-2">
            <Text className="text-green-50 text-sm">Ingresos fijos:</Text>
            <Text className="text-white text-sm font-bold">${totales.sumaFijos.toFixed(2)}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-green-50 text-sm">Ingresos variables:</Text>
            <Text className="text-white text-sm font-bold">${totales.sumaVariables.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Modal for Variable Income */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View className="flex-1 justify-center items-center bg-black/50 px-4">
          <View className="bg-white w-full rounded-3xl p-6">
            <Text className="text-2xl font-bold text-gray-800 mb-6">Nuevo Ingreso Variable</Text>
            
            <Text className="text-sm text-gray-500 mb-2">Descripción (ej. Freelance)</Text>
            <TextInput 
              className="border border-gray-300 rounded-xl px-4 py-3 mb-4 text-lg text-gray-900"
              placeholder="Descripción"
              value={newVarName}
              onChangeText={setNewVarName}
            />

            <Text className="text-sm text-gray-500 mb-2">Monto</Text>
            <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 mb-8">
              <Text className="text-gray-500 text-lg mr-2">$</Text>
              <TextInput 
                className="flex-1 text-lg text-gray-900"
                keyboardType="numeric"
                placeholder="0.00"
                value={newVarAmount}
                onChangeText={setNewVarAmount}
              />
            </View>

            <View className="flex-row justify-end space-x-4">
              <TouchableOpacity 
                className="px-6 py-3 rounded-xl bg-gray-100"
                onPress={() => setIsModalVisible(false)}
              >
                <Text className="text-gray-600 font-bold">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="px-6 py-3 rounded-xl bg-green-500"
                onPress={handleAddVariable}
              >
                <Text className="text-white font-bold">Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}
