import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { TrendingUp, PiggyBank, Wallet, TrendingDown, Search, User, Smile, Cat, Dog, Bot, Ghost, Crown, CreditCard, CheckCircle, Circle, Edit3, X } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getTotalesMes, getUsuario, getFondos, getTotalEgresosMes, getTarjetaCredito, upsertTarjetaCredito, marcarPagoTarjeta, desmarcarPagoTarjeta } from '../db/queries';

// Helper: days remaining until payment day
const getDiasRestantes = (diaPago: number): number => {
  const hoy = new Date();
  const diaHoy = hoy.getDate();
  const mesActual = hoy.getMonth();
  const anioActual = hoy.getFullYear();

  let fechaPago: Date;
  if (diaPago > diaHoy) {
    fechaPago = new Date(anioActual, mesActual, diaPago);
  } else {
    fechaPago = new Date(anioActual, mesActual + 1, diaPago);
  }

  const diff = fechaPago.getTime() - hoy.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const getStatusColor = (dias: number, pagado: boolean) => {
  if (pagado) return { bg: '#dcfce7', border: '#bbf7d0', text: '#16a34a', label: '✅ Pagado' };
  if (dias <= 2) return { bg: '#fef2f2', border: '#fecaca', text: '#dc2626', label: '🔴 ¡Urgente!' };
  if (dias <= 10) return { bg: '#fefce8', border: '#fef08a', text: '#ca8a04', label: '🟡 Próximamente' };
  return { bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a', label: '🟢 Tranquilo' };
};

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [ingresoMes, setIngresoMes] = useState(0);
  const [ahorroTotal, setAhorroTotal] = useState(0);
  const [nombre, setNombre] = useState('Juan');
  const [avatar, setAvatar] = useState('User');
  const [fondosTotal, setFondosTotal] = useState(0);
  const [egresosTotal, setEgresosTotal] = useState(0);
  const [userId, setUserId] = useState<number | null>(null);

  // Credit card state
  const [diaPago, setDiaPago] = useState('');
  const [diaPagoGuardado, setDiaPagoGuardado] = useState<number | null>(null);
  const [pagado, setPagado] = useState(false);

  // Modal for setting payment day
  const [diaModalVisible, setDiaModalVisible] = useState(false);
  const [diaModalInput, setDiaModalInput] = useState('');

  // Confirmation modal for marking as paid
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      try {
        const totalIngresos = getTotalesMes().totalMes || 0;
        setIngresoMes(totalIngresos);
        const user = getUsuario();
        if (user) {
          setNombre(user.nombre || 'Juan');
          setAvatar(user.avatar || 'User');
          setUserId(user.id_usuario);

          const pctAhorro = user.pct_ahorro !== undefined ? user.pct_ahorro : 15;
          const pctInversion = user.pct_inversion !== undefined ? user.pct_inversion : 10;
          const minAhorro = user.min_ahorro || 0;
          const minInversion = user.min_inversion || 0;

          const calcAhorro = Math.max((totalIngresos * pctAhorro) / 100, minAhorro);
          const calcInversion = Math.max((totalIngresos * pctInversion) / 100, minInversion);
          setAhorroTotal(calcAhorro + calcInversion);

          const fondosUser = getFondos(user.id_usuario);
          const totalFondos = fondosUser.reduce((sum: number, f: any) => sum + (f.meta || 0), 0);
          setFondosTotal(totalFondos);

          const egresos = getTotalEgresosMes(user.id_usuario);
          setEgresosTotal(egresos.totalEgresos);

          // Load credit card
          const tarjeta = getTarjetaCredito(user.id_usuario);
          if (tarjeta) {
            setDiaPago(String(tarjeta.dia_pago));
            setDiaPagoGuardado(tarjeta.dia_pago);
            setPagado(tarjeta.pagado === 1);
          }
        }
      } catch (e) {
        console.error("Error loading home totals", e);
      }
    }, [])
  );

  // Open modal to set/edit payment day
  const openDiaModal = () => {
    setDiaModalInput(diaPagoGuardado ? String(diaPagoGuardado) : '');
    setDiaModalVisible(true);
  };

  // Save payment day from modal
  const handleGuardarDiaModal = () => {
    const dia = parseInt(diaModalInput);
    if (!dia || dia < 1 || dia > 31) {
      Alert.alert('Error', 'Ingresa un día válido (1-31)');
      return;
    }
    if (userId) {
      upsertTarjetaCredito(userId, dia);
      setDiaPago(String(dia));
      setDiaPagoGuardado(dia);
      setDiaModalVisible(false);
    }
  };

  // Handle payment toggle with confirmation
  const handleTogglePago = () => {
    if (!userId) return;
    if (pagado) {
      // Unmark: just unmark directly
      desmarcarPagoTarjeta(userId);
      setPagado(false);
    } else {
      // Mark as paid: show confirmation modal
      setConfirmModalVisible(true);
    }
  };

  // Confirm payment
  const confirmarPago = () => {
    if (!userId) return;
    marcarPagoTarjeta(userId);
    setPagado(true);
    setConfirmModalVisible(false);
  };

  const dineroDisponible = ingresoMes - ahorroTotal - fondosTotal - egresosTotal;
  const isNegative = dineroDisponible < 0;
  const diasRestantes = diaPagoGuardado ? getDiasRestantes(diaPagoGuardado) : null;
  const statusColor = diasRestantes !== null ? getStatusColor(diasRestantes, pagado) : null;

  return (
    <ScrollView className="flex-1 bg-[#f8fafc]">
      {/* Header Section - more compact */}
      <View className={`${isNegative ? 'bg-red-500' : 'bg-blue-500'} rounded-b-[32px] px-5 pt-14 pb-6`}>
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-white text-2xl font-bold mb-0.5">Hola {nombre}</Text>
            <Text className={`${isNegative ? 'text-red-100' : 'text-blue-100'} text-sm`}>¿Qué quieres ver hoy?</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            className="w-12 h-12 bg-white/20 rounded-full items-center justify-center border-2 border-white/30"
          >
            {(() => {
              const AVATARS: Record<string, any> = { User, Smile, Cat, Dog, Bot, Ghost, Crown };
              const IconComponent = AVATARS[avatar] || User;
              return <IconComponent color="#ffffff" size={24} />;
            })()}
          </TouchableOpacity>
        </View>

        {/* Balance Card - more compact */}
        <View className={`${isNegative ? 'bg-red-400/50' : 'bg-blue-400/50'} rounded-2xl p-4`}>
          <Text className={`${isNegative ? 'text-red-50' : 'text-blue-50'} text-xs mb-0.5`}>Tu dinero:</Text>
          <View className="flex-row items-end">
            <Text className="text-white text-3xl font-bold">${dineroDisponible.toFixed(2)}</Text>
            <Text className="text-white text-base ml-2 mb-0.5">MXN</Text>
          </View>
        </View>
      </View>

      {/* Main Content Area */}
      <View className="px-5 pt-4 pb-20">

        {/* 2x2 Grid - tighter spacing */}
        <View className="flex-row flex-wrap justify-between">

          {/* Card 1: Ingresos */}
          <TouchableOpacity
            className="bg-white rounded-2xl w-[48%] p-3.5 mb-3 shadow-sm border border-gray-100"
            onPress={() => navigation.navigate('Ingresos')}
          >
            <View className="bg-green-100 w-10 h-10 rounded-full items-center justify-center mb-3">
              <TrendingUp color="#22c55e" size={20} />
            </View>
            <Text className="text-gray-600 text-xs font-medium mb-0.5">Ingresos</Text>
            <Text className="text-gray-900 text-lg font-bold">${ingresoMes.toFixed(2)}</Text>
          </TouchableOpacity>

          {/* Card 2: Ahorro/Inversión */}
          <TouchableOpacity
            className="bg-white rounded-2xl w-[48%] p-3.5 mb-3 shadow-sm border border-gray-100"
            onPress={() => navigation.navigate('AhorroInversion')}
          >
            <View className="bg-blue-100 w-10 h-10 rounded-full items-center justify-center mb-3">
              <PiggyBank color="#3b82f6" size={20} />
            </View>
            <Text className="text-gray-600 text-xs font-medium mb-0.5">Ahorro/Inversión</Text>
            <Text className="text-gray-900 text-lg font-bold">${ahorroTotal.toFixed(2)}</Text>
          </TouchableOpacity>

          {/* Card 3: Fondos */}
          <TouchableOpacity
            className="bg-white rounded-2xl w-[48%] p-3.5 mb-3 shadow-sm border border-gray-100"
            onPress={() => navigation.navigate('Fondos')}
          >
            <View className="bg-purple-100 w-10 h-10 rounded-full items-center justify-center mb-3">
              <Wallet color="#a855f7" size={20} />
            </View>
            <Text className="text-gray-600 text-xs font-medium mb-0.5">Fondos</Text>
            <Text className="text-gray-900 text-lg font-bold">${fondosTotal.toFixed(2)}</Text>
          </TouchableOpacity>

          {/* Card 4: Egresos */}
          <TouchableOpacity
            className="bg-white rounded-2xl w-[48%] p-3.5 mb-3 shadow-sm border border-gray-100"
            onPress={() => navigation.navigate('Egresos')}
          >
            <View className="bg-red-100 w-10 h-10 rounded-full items-center justify-center mb-3">
              <TrendingDown color="#ef4444" size={20} />
            </View>
            <Text className="text-gray-600 text-xs font-medium mb-0.5">Egresos</Text>
            <Text className="text-gray-900 text-lg font-bold">${egresosTotal.toFixed(2)}</Text>
          </TouchableOpacity>

        </View>

        {/* ========== TARJETA DE CRÉDITO SECTION ========== */}
        <View className="bg-[#7c3aed] rounded-2xl p-5 mt-3 mb-3">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <View className="bg-white/20 w-10 h-10 rounded-full items-center justify-center mr-3">
                <CreditCard color="#ffffff" size={20} />
              </View>
              <Text className="text-white text-lg font-bold">Tu Tarjeta de Crédito</Text>
            </View>
            {/* Edit/Set day button */}
            <TouchableOpacity
              onPress={openDiaModal}
              className="bg-white/20 rounded-full w-9 h-9 items-center justify-center"
            >
              <Edit3 color="#ffffff" size={16} />
            </TouchableOpacity>
          </View>

          {/* Show current payment day or prompt to set one */}
          {diaPagoGuardado === null ? (
            <TouchableOpacity
              onPress={openDiaModal}
              className="bg-white/15 rounded-xl py-4 items-center border border-white/20"
            >
              <Text className="text-white text-sm font-semibold">Configura tu día de pago</Text>
              <Text className="text-purple-200 text-xs mt-1">Toca aquí para definirlo</Text>
            </TouchableOpacity>
          ) : (
            <>
              {/* Status indicator */}
              {statusColor && (
                <View
                  className="rounded-xl p-4 mb-3"
                  style={{ backgroundColor: statusColor.bg, borderWidth: 1, borderColor: statusColor.border }}
                >
                  <View className="flex-row justify-between items-center mb-1">
                    <Text style={{ color: statusColor.text }} className="text-base font-bold">
                      {statusColor.label}
                    </Text>
                    <Text style={{ color: statusColor.text }} className="text-sm font-semibold">
                      {pagado ? 'Pagado este mes' : `${diasRestantes} días restantes`}
                    </Text>
                  </View>
                  <Text style={{ color: statusColor.text }} className="text-xs">
                    Próximo pago: día {diaPagoGuardado} de cada mes
                  </Text>
                </View>
              )}

              {/* Pago toggle */}
              {!pagado ? (
                <TouchableOpacity
                  onPress={handleTogglePago}
                  className="rounded-xl py-3 flex-row justify-center items-center bg-white/20"
                >
                  <Circle color="#ffffff" size={18} />
                  <Text className="text-white text-sm font-bold ml-2">
                    Marcar como pagado
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={handleTogglePago}
                  className="rounded-xl py-3 flex-row justify-center items-center bg-green-500"
                >
                  <CheckCircle color="#ffffff" size={18} />
                  <Text className="text-white text-sm font-bold ml-2">
                    Pago realizado ✓
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        {/* Bottom Banner */}
        <TouchableOpacity
          className="bg-blue-500 rounded-2xl p-4 flex-row items-center mt-1"
          onPress={() => navigation.navigate('SaludFinanciera')}
        >
          <View className="bg-blue-400 w-10 h-10 rounded-full items-center justify-center mr-3">
            <Search color="#ffffff" size={20} />
          </View>
          <Text className="text-white text-sm font-medium flex-shrink">
            ¿Quieres mejorar tu salud financiera?
          </Text>
        </TouchableOpacity>

      </View>

      {/* ========== MODAL: Set Payment Day ========== */}
      <Modal visible={diaModalVisible} transparent={true} animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/50 px-8">
          <View className="bg-white rounded-3xl w-full p-6">
            {/* Modal Header */}
            <View className="flex-row justify-between items-center mb-6">
              <View className="flex-row items-center">
                <View className="bg-purple-100 w-12 h-12 rounded-full items-center justify-center mr-3">
                  <CreditCard color="#7c3aed" size={22} />
                </View>
                <Text className="text-gray-900 text-lg font-bold">Día de pago</Text>
              </View>
              <TouchableOpacity
                onPress={() => setDiaModalVisible(false)}
                className="bg-gray-100 w-8 h-8 rounded-full items-center justify-center"
              >
                <X color="#6b7280" size={16} />
              </TouchableOpacity>
            </View>

            <Text className="text-gray-500 text-sm mb-4">
              Ingresa el día del mes en que debes pagar tu tarjeta de crédito (1-31).
            </Text>

            {/* Large centered input */}
            <View className="items-center mb-6">
              <TextInput
                className="bg-gray-50 border-2 border-purple-300 rounded-2xl w-28 py-4 text-center text-gray-900 text-4xl font-bold"
                placeholder="15"
                placeholderTextColor="#d1d5db"
                keyboardType="numeric"
                maxLength={2}
                value={diaModalInput}
                onChangeText={setDiaModalInput}
                autoFocus={true}
              />
              <Text className="text-gray-400 text-xs mt-2">de cada mes</Text>
            </View>

            {/* Action buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setDiaModalVisible(false)}
                className="flex-1 py-3.5 rounded-xl items-center border border-gray-200"
              >
                <Text className="text-gray-600 text-base font-semibold">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleGuardarDiaModal}
                className="flex-1 py-3.5 rounded-xl items-center bg-[#7c3aed]"
              >
                <Text className="text-white text-base font-semibold">Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========== MODAL: Confirm Payment ========== */}
      <Modal visible={confirmModalVisible} transparent={true} animationType="fade">
        <View className="flex-1 justify-center items-center bg-black/50 px-8">
          <View className="bg-white rounded-3xl w-full p-6">
            {/* Icon */}
            <View className="items-center mb-5">
              <View className="bg-green-100 w-16 h-16 rounded-full items-center justify-center mb-4">
                <CheckCircle color="#16a34a" size={32} />
              </View>
              <Text className="text-gray-900 text-xl font-bold text-center">¿Confirmar pago?</Text>
              <Text className="text-gray-500 text-sm text-center mt-2">
                ¿Ya realizaste el pago de tu tarjeta de crédito este mes?
              </Text>
            </View>

            {/* Payment info */}
            {diaPagoGuardado && (
              <View className="bg-gray-50 rounded-xl p-4 mb-5">
                <View className="flex-row justify-between mb-1">
                  <Text className="text-gray-500 text-sm">Día de pago:</Text>
                  <Text className="text-gray-900 text-sm font-bold">Día {diaPagoGuardado}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-500 text-sm">Estado actual:</Text>
                  <Text className="text-orange-500 text-sm font-bold">Pendiente</Text>
                </View>
              </View>
            )}

            {/* Action buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setConfirmModalVisible(false)}
                className="flex-1 py-3.5 rounded-xl items-center border border-gray-200"
              >
                <Text className="text-gray-600 text-base font-semibold">No, aún no</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmarPago}
                className="flex-1 py-3.5 rounded-xl items-center bg-green-500"
              >
                <Text className="text-white text-base font-semibold">Sí, ya pagué</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
