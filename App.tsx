import './global.css';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { initDatabase } from './src/db/database';
import { insertTestUser } from './src/db/queries';
import HomeScreen from './src/screens/HomeScreen';
import IngresosScreen from './src/screens/IngresosScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AhorroInversionScreen from './src/screens/AhorroInversionScreen';
import FondosScreen from './src/screens/FondosScreen';
import EgresosScreen from './src/screens/EgresosScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isDbReady, setIsDbReady] = useState(false);

  useEffect(() => {
    try {
      initDatabase();
      insertTestUser(); 
      setIsDbReady(true);
    } catch (error) {
      console.error('Error initializing database', error);
    }
  }, []);

  if (!isDbReady) return null; // Evita que carguen las pantallas antes que la BD

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
        />
        <Stack.Screen 
          name="Ingresos" 
          component={IngresosScreen} 
        />
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen} 
        />
        <Stack.Screen 
          name="AhorroInversion" 
          component={AhorroInversionScreen} 
        />
        <Stack.Screen 
          name="Fondos" 
          component={FondosScreen} 
        />
        <Stack.Screen 
          name="Egresos" 
          component={EgresosScreen} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
