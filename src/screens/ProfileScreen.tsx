import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { ArrowLeft, User, Smile, Cat, Dog, Bot, Ghost, Crown, Check } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { getUsuario, updateUser } from '../db/queries';

const AVATARS = [
  { id: 'User', icon: User },
  { id: 'Smile', icon: Smile },
  { id: 'Cat', icon: Cat },
  { id: 'Dog', icon: Dog },
  { id: 'Bot', icon: Bot },
  { id: 'Ghost', icon: Ghost },
  { id: 'Crown', icon: Crown },
];

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const [nombre, setNombre] = useState('');
  const [avatarSeleccionado, setAvatarSeleccionado] = useState('User');
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const fetchUser = () => {
      try {
        const user = getUsuario();
        if (user) {
          setUserId(user.id_usuario);
          setNombre(user.nombre || '');
          setAvatarSeleccionado(user.avatar || 'User');
        }
      } catch (error) {
        console.error("Error loading user profile", error);
      }
    };
    fetchUser();
  }, []);

  const handleSave = () => {
    if (userId && nombre.trim() !== '') {
      try {
        updateUser(userId, nombre.trim(), avatarSeleccionado);
        navigation.goBack();
      } catch (error) {
        console.error("Error saving user profile", error);
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
        <View className="bg-blue-500 rounded-b-[40px] px-6 pt-16 pb-8">
          <View className="flex-row items-center mb-6">
            <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
              <ArrowLeft color="#ffffff" size={28} />
            </TouchableOpacity>
            <Text className="text-white text-2xl font-bold">Mi Perfil</Text>
          </View>
          <Text className="text-blue-100 text-base">Personaliza tu experiencia</Text>
        </View>

        {/* Content */}
        <View className="px-6 pt-8 pb-20">
          
          {/* Nombre Input */}
          <View className="mb-8">
            <Text className="text-gray-700 text-lg font-bold mb-2">Tu Nombre</Text>
            <TextInput
              className="bg-white px-4 py-4 rounded-xl border border-gray-200 text-gray-800 text-lg shadow-sm"
              placeholder="Ej. Juan"
              placeholderTextColor="#9ca3af"
              value={nombre}
              onChangeText={setNombre}
              maxLength={15}
            />
            <Text className="text-gray-400 text-sm mt-1 text-right">{nombre.length}/15 caracteres</Text>
          </View>

          {/* Avatar Selector */}
          <View className="mb-10">
            <Text className="text-gray-700 text-lg font-bold mb-4">Elige tu Avatar</Text>
            <View className="flex-row flex-wrap justify-center">
              {AVATARS.map((av) => {
                const IconComponent = av.icon;
                const isSelected = avatarSeleccionado === av.id;
                return (
                  <TouchableOpacity
                    key={av.id}
                    onPress={() => setAvatarSeleccionado(av.id)}
                    className={`w-[22%] aspect-square rounded-2xl items-center justify-center border-2 shadow-sm m-[1.5%] ${
                      isSelected ? 'bg-blue-50 border-blue-500' : 'bg-white border-transparent'
                    }`}
                  >
                    <IconComponent 
                      color={isSelected ? '#3b82f6' : '#64748b'} 
                      size={36} 
                      strokeWidth={isSelected ? 2.5 : 2}
                    />
                    {isSelected && (
                      <View className="absolute -top-2 -right-2 bg-blue-500 rounded-full p-1">
                        <Check color="#ffffff" size={12} strokeWidth={3} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity 
            className={`rounded-2xl p-4 items-center shadow-sm ${nombre.trim() === '' ? 'bg-gray-300' : 'bg-blue-500'}`}
            onPress={handleSave}
            disabled={nombre.trim() === ''}
          >
            <Text className="text-white text-lg font-bold">Guardar Cambios</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
