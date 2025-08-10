// App.js
import { Linking } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './AuthContext';
import LoginScreen from './screens/LoginScreen';
import CustomHeader from './components/CustomHeader';

import React, { useCallback, useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BottomTabs from './components/BottomTabs';

// Importe todas as suas telas aqui...
import AutorList from './screens/AutorList';
import AutorForm from './screens/AutorForm';
import AutorDetails from './screens/AutorDetails';
import AutorPublishings from './screens/AutorPublishings';
import ObraForm from './screens/ObraForm';
import ObraDetalhes from './screens/ObraDetalhes';
import Eventos from './screens/EventoList';
import EventoForm from './screens/Evento/EventoForm';
import Programacao from './screens/Programacao';
import ProgramacaoForm from './screens/ProgramacaoForm';
import Endpoints from './screens/Endpoints';
import UserList from './screens/UserList';
import UserForm from './screens/UserForm';
import ClippingList from './screens/ClippingList';
import ClippingForm from './screens/ClippingForm';
import ProgramacaoDetails from './screens/ProgramacaoDetails';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import EventoDetails from './screens/EventoDetails';
import DetalhesNoticia from './screens/DetalhesNoticias';
import EmptyFeatureScreen from './screens/EmptyFeatureScreen';
import * as SplashScreen from 'expo-splash-screen';
import HomeScreen from './screens/Home';



const Stack = createNativeStackNavigator();

const MainNavigator = () => {

  const { userInfo, signOut } = useAuth();

  return (
    <Stack.Navigator
      initialRouteName={userInfo ? 'EndPoints' : 'Login'}
      screenOptions={{
        header: (props) => <CustomHeader {...props} />,
      }}
    >
      {/* Telas públicas */}
      {!userInfo && (
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }}/>
      )}

      {/* Telas privadas (usuário logado) */}
      {userInfo && (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="EndPoints" component={Endpoints} />
          <Stack.Screen name="AutorList" component={AutorList} />
          <Stack.Screen name="AutorForm" component={AutorForm} />
          <Stack.Screen name="AutorDetails" component={AutorDetails} />
          <Stack.Screen name="AutorPublishings" component={AutorPublishings} />
          <Stack.Screen name="ObraForm" component={ObraForm} />
          <Stack.Screen name="ObraDetalhes" component={ObraDetalhes} />
          <Stack.Screen name="Eventos" component={Eventos} />
          <Stack.Screen name="EventoForm" component={EventoForm} />
          <Stack.Screen name="EventoDetails" component={EventoDetails} />
          <Stack.Screen name="Programacao" component={Programacao} />
          <Stack.Screen name="ProgramacaoForm" component={ProgramacaoForm} />
          <Stack.Screen name="ProgramacaoDetails" component={ProgramacaoDetails} />
          <Stack.Screen name="UserList" component={UserList} />
          <Stack.Screen name="UserForm" component={UserForm} />
          <Stack.Screen name="ClippingForm" component={ClippingForm} />
          <Stack.Screen name="EventoList" component={Eventos} />
          <Stack.Screen name="ClippingList" component={ClippingList} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          <Stack.Screen name="DetalhesNoticias" component={DetalhesNoticia} />
          <Stack.Screen name="Descontos" component={EmptyFeatureScreen} initialParams={{ featureName: 'Descontos' }} />
          <Stack.Screen name="Promocoes" component={EmptyFeatureScreen} initialParams={{ featureName: 'Promoções' }} />
          <Stack.Screen name="Vouchers" component={EmptyFeatureScreen} initialParams={{ featureName: 'Vouchers' }} />

        </>
      )}

      {/* Telas sempre acessíveis, inclusive por deep linking */}
      <Stack.Screen
        name="resetpassword"
        component={ResetPasswordScreen}
        options={{ title: 'Redefinir Senha', headerShown: false }}
      />
    </Stack.Navigator>
  );

};

export default function App() {

  // Configuração para mapear URLs para rotas
  const linking = {
    prefixes: ['http://localhost:8081'], // Prefixo da sua URL (ajuste para produção)
    config: {
      screens: {
        Login: 'login', // Rota opcional (não necessária neste caso)
        resetpassword: 'resetpassword/:token', // Padrão da URL
      },
    },
  };
  
  return (
    <AuthProvider>
      <NavigationContainer
        linking={linking} // Adicione esta prop
        fallback={<Text>Carregando...</Text>} // Fallback durante carregamento
      > 
        <MainNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

