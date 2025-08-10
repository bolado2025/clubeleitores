import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Eventos from '../screens/EventoList';
import AutorList from '../screens/AutorList';
import LoginScreen from '../screens/LoginScreen';
import ProfileScreen from '../screens/ProfileScreen';
import Busca from '../screens/Busca';
import Calendar from '../screens/Calendar';
import HomeScreen from '../screens/Home';
import { useAuth } from '../AuthContext';

const Tab = createBottomTabNavigator();

const BottomTabs = () => {
  const { userInfo } = useAuth();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Autores') iconName = focused ? 'book' : 'book-outline';
          else if (route.name === 'Busca') iconName = focused ? 'search' : 'search-outline';
          else if (route.name === 'Calendar') iconName = focused ? 'calendar' : 'calendar-outline';
          else if (route.name === 'Perfil') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3498db',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
          height: 60 + (insets.bottom || 0),
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Eventos' }} />
      <Tab.Screen name="Autores" component={AutorList} options={{ title: 'Autores' }} />
      <Tab.Screen name="Busca" component={Busca} options={{ title: 'Pesquisa' }} />
      <Tab.Screen name="Calendar" component={Calendar} options={{ title: 'Calendário' }} />
      <Tab.Screen
        name="Perfil"
        component={userInfo ? ProfileScreen : LoginScreen}
        options={{ title: 'Perfil' }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabs;
