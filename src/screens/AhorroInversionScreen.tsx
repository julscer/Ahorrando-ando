import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { ArrowLeft, PiggyBank, TrendingUp, Lightbulb } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import Slider from '@react-native-community/slider';
import { getUsuario, getTotalesMes, updateAhorroInversionConfig } from '../db/queries';

export default function AhorroInversionScreen() {
  const navigation = useNavigation<any>();
  
  // States
  const [userId, setUserId] = useState<number | null>(null);
  const [ingresosTotales, setIngresosTotales] = useState(0);
  
  // Percentages
  const [pctAhorro, setPctAhorro] = useState(15);
  const [pctInversion, setPctInversion] = useState(10);
  
  // Minimums
  const [minAhorro, setMinAhorro] = useState('0');
  const [minInversion, setMinInversion] = useState('0');

  useEffect(() => {
    try {
      const user = getUsuario();
      if (user) {
        setUserId(user.id_usuario);
        setPctAhorro(user.pct_ahorro !== undefined ? user.pct_ahorro : 15);
        setPctInversion(user.pct_inversion !== undefined ? user.pct_inversion : 10);
        setMinAhorro(user.min_ahorro ? String(user.min_ahorro) : '0');
        setMinInversion(user.min_inversion ? String(user.min_inversion) : '0');
      }
      
      const { totalMes } = getTotalesMes();
      setIngresosTotales(totalMes || 0);
    } catch (e) {
      console.error("Error loading config:", e);
    }
  }, []);

  // Calculations
  const calcAhorro = Math.max((ingresosTotales * pctAhorro) / 100, parseFloat(minAhorro) || 0);
  const calcInversion = Math.max((ingresosTotales * pctInversion) / 100, parseFloat(minInversion) || 0);
  const totalDedicado = calcAhorro + calcInversion;
  const pctTotal = pctAhorro + pctInversion;
  const minTotal = (parseFloat(minAhorro) || 0) + (parseFloat(minInversion) || 0);

  const handleSave = () => {
    if (userId) {
      try {
        updateAhorroInversionConfig(
          userId, 
          pctAhorro, 
          pctInversion, 
          parseFloat(minAhorro) || 0, 
          parseFloat(minInversion) || 0
        );
        navigation.goBack();
      } catch (e) {
        console.error("Error saving config:", e);
      }
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-[#f8fafc]"
    >
      <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View className="bg-blue-500 px-6 pt-16 pb-20">
          <View className="flex-row items-center mb-6">
            <TouchableOpacity onPress={() => navigation.goBack()} className="mr-2 flex-row items-center">
              <ArrowLeft color="#ffffff" size={24} />
              <Text className="text-white text-base font-semibold ml-2">Volver</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-white text-4xl font-bold">Ahorro e Inversión</Text>
        </View>

        {/* Content Box (pulled up to overlap header) */}
        <View className="px-6 -mt-10 pb-20">
          
          {/* AHORRO CARD */}
          <View className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
            <View className="flex-row items-center mb-6">
              <View className="bg-green-100 w-14 h-14 rounded-full items-center justify-center mr-4">
                <PiggyBank color="#22c55e" size={28} />
              </View>
              <Text className="text-gray-800 text-2xl font-bold">Ahorro General</Text>
            </View>

            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={0}
              maximumValue={100}
              step={1}
              value={pctAhorro}
              onValueChange={setPctAhorro}
              minimumTrackTintColor="#86efac"
              maximumTrackTintColor="#dcfce3"
              thumbTintColor="#16a34a"
            />

            <View className="flex-row items-center justify-between mt-2 mb-6">
              <Text className="text-gray-600 text-lg">Porcentaje:</Text>
              <View className="flex-row items-center">
                <TextInput
                  className="bg-white border border-gray-300 rounded-xl px-4 py-2 text-lg text-center w-20"
                  keyboardType="numeric"
                  value={String(pctAhorro)}
                  onChangeText={(val) => {
                    const num = parseInt(val) || 0;
                    setPctAhorro(num > 100 ? 100 : num);
                  }}
                  maxLength={3}
                />
                <Text className="text-green-600 text-2xl font-bold ml-2">%</Text>
              </View>
            </View>

            <View className="border-t border-gray-100 pt-4">
              <Text className="text-gray-500 text-sm mb-1">Cantidad dedicada al ahorro:</Text>
              <Text className="text-green-600 text-3xl font-bold">${calcAhorro.toFixed(2)} MXN</Text>
            </View>
          </View>

          {/* INVERSIÓN CARD */}
          <View className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
            <View className="flex-row items-center mb-6">
              <View className="bg-blue-100 w-14 h-14 rounded-full items-center justify-center mr-4">
                <TrendingUp color="#3b82f6" size={28} />
              </View>
              <Text className="text-gray-800 text-2xl font-bold">Inversión</Text>
            </View>

            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={0}
              maximumValue={100}
              step={1}
              value={pctInversion}
              onValueChange={setPctInversion}
              minimumTrackTintColor="#93c5fd"
              maximumTrackTintColor="#dbeafe"
              thumbTintColor="#2563eb"
            />

            <View className="flex-row items-center justify-between mt-2 mb-6">
              <Text className="text-gray-600 text-lg">Porcentaje:</Text>
              <View className="flex-row items-center">
                <TextInput
                  className="bg-white border border-gray-300 rounded-xl px-4 py-2 text-lg text-center w-20"
                  keyboardType="numeric"
                  value={String(pctInversion)}
                  onChangeText={(val) => {
                    const num = parseInt(val) || 0;
                    setPctInversion(num > 100 ? 100 : num);
                  }}
                  maxLength={3}
                />
                <Text className="text-blue-600 text-2xl font-bold ml-2">%</Text>
              </View>
            </View>

            <View className="border-t border-gray-100 pt-4">
              <Text className="text-gray-500 text-sm mb-1">Cantidad dedicada a inversión:</Text>
              <Text className="text-blue-600 text-3xl font-bold">${calcInversion.toFixed(2)} MXN</Text>
            </View>
          </View>

          {/* TOTAL DEDICADO CARD */}
          <View className="bg-blue-500 rounded-3xl p-6 shadow-sm mb-10">
            <Text className="text-blue-100 text-base mb-1">Tu dinero dedicado en mejorarte es:</Text>
            <Text className="text-white text-4xl font-bold mb-4">${totalDedicado.toFixed(2)} <Text className="text-2xl font-normal">MXN</Text></Text>
            <Text className="text-blue-100 text-sm">
              {pctAhorro}% ahorro + {pctInversion}% inversión = {pctTotal}% total
            </Text>
          </View>

          {/* YELLOW SECTION: CORTOS DE DINERO */}
          <View className="bg-[#fefce8] -mx-6 px-6 py-8 border-t border-yellow-200">
            <Text className="text-gray-800 text-2xl font-bold mb-2">¿Estás corto de dinero?</Text>
            <Text className="text-gray-600 text-base mb-6">No te preocupes, define un valor "mínimo de inversión"</Text>

            <View className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-gray-100">
              <Text className="text-gray-700 text-base font-semibold mb-3">Ahorro mínimo mensual:</Text>
              <View className="flex-row items-center">
                <Text className="text-gray-500 text-lg mr-2">$</Text>
                <TextInput
                  className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-3 text-lg"
                  keyboardType="numeric"
                  value={minAhorro}
                  onChangeText={setMinAhorro}
                />
                <Text className="text-gray-500 text-lg ml-4">MXN</Text>
              </View>
            </View>

            <View className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-gray-100">
              <Text className="text-gray-700 text-base font-semibold mb-3">Inversión mínima mensual:</Text>
              <View className="flex-row items-center">
                <Text className="text-gray-500 text-lg mr-2">$</Text>
                <TextInput
                  className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-3 text-lg"
                  keyboardType="numeric"
                  value={minInversion}
                  onChangeText={setMinInversion}
                />
                <Text className="text-gray-500 text-lg ml-4">MXN</Text>
              </View>
            </View>

            <View className="bg-[#eab308] rounded-2xl p-6 shadow-sm mb-6">
              <Text className="text-yellow-900 text-sm mb-1">Total mínimo dedicado:</Text>
              <Text className="text-yellow-900 text-3xl font-bold">${minTotal.toFixed(2)} MXN</Text>
            </View>

            <View className="bg-blue-100 rounded-2xl p-5 flex-row">
              <View className="mr-3 mt-1">
                <Lightbulb color="#eab308" size={20} />
              </View>
              <Text className="flex-1 text-blue-900 text-sm leading-5">
                <Text className="font-bold">Este será el dinero que siempre irá dedicado</Text> a mejorar tu salud financiera, sin importar tus ingresos mensuales.
              </Text>
            </View>

          </View>

          {/* SAVE BUTTON */}
          <TouchableOpacity 
            className="bg-blue-600 rounded-2xl p-4 items-center shadow-md mt-6"
            onPress={handleSave}
          >
            <Text className="text-white text-xl font-bold">Guardar Cambios</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
