import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { TrendingUp, PiggyBank, Wallet, TrendingDown, Search, User, Smile, Cat, Dog, Bot, Ghost, Crown } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getTotalesMes, getUsuario, getFondos, getTotalEgresosMes } from '../db/queries';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const [ingresoMes, setIngresoMes] = useState(0);
  const [ahorroTotal, setAhorroTotal] = useState(0);
  const [nombre, setNombre] = useState('Juan');
  const [avatar, setAvatar] = useState('User');
  const [fondosTotal, setFondosTotal] = useState(0);
  const [egresosTotal, setEgresosTotal] = useState(0);

  useFocusEffect(
    useCallback(() => {
      try {
        const totalIngresos = getTotalesMes().totalMes || 0;
        setIngresoMes(totalIngresos);
        const user = getUsuario();
        if (user) {
          setNombre(user.nombre || 'Juan');
          setAvatar(user.avatar || 'User');
          
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
        }
      } catch (e) {
        console.error("Error loading home totals", e);
      }
    }, [])
  );

  return (
    <ScrollView className="flex-1 bg-[#f8fafc]">
      {/* Header Section */}
      <View className={`${(ingresoMes - ahorroTotal - fondosTotal - egresosTotal) < 0 ? 'bg-red-500' : 'bg-blue-500'} rounded-b-[40px] px-6 pt-16 pb-8`}>
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-white text-3xl font-bold mb-1">Hola {nombre}</Text>
            <Text className={`${(ingresoMes - ahorroTotal - fondosTotal - egresosTotal) < 0 ? 'text-red-100' : 'text-blue-100'} text-base`}>¿Qué quieres ver hoy?</Text>
          </View>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Profile')}
            className="w-14 h-14 bg-white/20 rounded-full items-center justify-center border-2 border-white/30 shadow-sm"
          >
            {(() => {
              const AVATARS: Record<string, any> = { User, Smile, Cat, Dog, Bot, Ghost, Crown };
              const IconComponent = AVATARS[avatar] || User;
              return <IconComponent color="#ffffff" size={28} />;
            })()}
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <View className={`${(ingresoMes - ahorroTotal - fondosTotal - egresosTotal) < 0 ? 'bg-red-400/50' : 'bg-blue-400/50'} rounded-2xl p-6`}>
          <Text className={`${(ingresoMes - ahorroTotal - fondosTotal - egresosTotal) < 0 ? 'text-red-50' : 'text-blue-50'} text-sm mb-1`}>Tu dinero:</Text>
          <View className="flex-row items-end">
            <Text className="text-white text-4xl font-bold">${(ingresoMes - ahorroTotal - fondosTotal - egresosTotal).toFixed(2)}</Text>
            <Text className="text-white text-lg ml-2 mb-1">MXN</Text>
          </View>
        </View>
      </View>

      {/* Main Content Area */}
      <View className="px-6 pt-6 pb-20">
        
        {/* 2x2 Grid using flex/wrap */}
        <View className="flex-row flex-wrap justify-between">
          
          {/* Card 1: Ingresos */}
          <TouchableOpacity 
            className="bg-white rounded-2xl w-[48%] p-4 mb-4 shadow-sm border border-gray-100"
            onPress={() => navigation.navigate('Ingresos')}
          >
            <View className="bg-green-100 w-12 h-12 rounded-full items-center justify-center mb-4">
              <TrendingUp color="#22c55e" size={24} />
            </View>
            <Text className="text-gray-600 text-sm font-medium mb-1">Ingresos</Text>
            <Text className="text-gray-900 text-xl font-bold text-left">${ingresoMes.toFixed(2)}</Text>
          </TouchableOpacity>

          {/* Card 2: Ahorro/Inversión */}
          <TouchableOpacity 
            className="bg-white rounded-2xl w-[48%] p-4 mb-4 shadow-sm border border-gray-100"
            onPress={() => navigation.navigate('AhorroInversion')}
          >
            <View className="bg-blue-100 w-12 h-12 rounded-full items-center justify-center mb-4">
              <PiggyBank color="#3b82f6" size={24} />
            </View>
            <Text className="text-gray-600 text-sm font-medium mb-1">Ahorro/Inversión</Text>
            <Text className="text-gray-900 text-xl font-bold text-left">${ahorroTotal.toFixed(2)}</Text>
          </TouchableOpacity>

          {/* Card 3: Fondos */}
          <TouchableOpacity 
            className="bg-white rounded-2xl w-[48%] p-4 mb-4 shadow-sm border border-gray-100"
            onPress={() => navigation.navigate('Fondos')}
          >
            <View className="bg-purple-100 w-12 h-12 rounded-full items-center justify-center mb-4">
              <Wallet color="#a855f7" size={24} />
            </View>
            <Text className="text-gray-600 text-sm font-medium mb-1">Fondos</Text>
            <Text className="text-gray-900 text-xl font-bold text-left">${fondosTotal.toFixed(2)}</Text>
          </TouchableOpacity>

          {/* Card 4: Egresos */}
          <TouchableOpacity 
            className="bg-white rounded-2xl w-[48%] p-4 mb-4 shadow-sm border border-gray-100"
            onPress={() => navigation.navigate('Egresos')}
          >
            <View className="bg-red-100 w-12 h-12 rounded-full items-center justify-center mb-4">
              <TrendingDown color="#ef4444" size={24} />
            </View>
            <Text className="text-gray-600 text-sm font-medium mb-1">Egresos</Text>
            <Text className="text-gray-900 text-xl font-bold text-left">${egresosTotal.toFixed(2)}</Text>
          </TouchableOpacity>

        </View>

        {/* Bottom Banner */}
        <TouchableOpacity className="bg-blue-500 rounded-2xl p-5 flex-row items-center mt-2">
          <View className="bg-blue-400 w-12 h-12 rounded-full items-center justify-center mr-4">
            <Search color="#ffffff" size={24} />
          </View>
          <Text className="text-white text-base font-medium flex-shrink">
            ¿Quieres mejorar tu salud financiera?
          </Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}
