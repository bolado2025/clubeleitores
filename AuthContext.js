// AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';
import showAlert from './utils/alertUtils';

WebBrowser.maybeCompleteAuthSession();

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [userInfo, setUserInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncAttempts, setSyncAttempts] = useState(0);
    const [syncError, setSyncError] = useState(false);
    const [lastSyncAttempt, setLastSyncAttempt] = useState(null);
    const [isFirstAttempt, setIsFirstAttempt] = useState(true);
    const [isSyncCompleted, setIsSyncCompleted] = useState(false);
    const [authMode, setAuthMode] = useState('login'); // 'login' ou 'signup'
    // Remova estas linhas do seu AuthContext.js se existirem:
    const [isRequestingReset, setIsRequestingReset] = useState(false);
    const [resetEmail, setResetEmail] = useState('');

    const clientid = process.env.EXPO_PUBLIC_AMBIENTE === 'dev'
        ? process.env.EXPO_PUBLIC_WEB_CLIENT_ID_DEV
        : process.env.EXPO_PUBLIC_WEB_CLIENT_ID_PROD;

    const endpoint = process.env.EXPO_PUBLIC_AMBIENTE === 'dev'
        ? process.env.EXPO_PUBLIC_API_URL_DEV
        : process.env.EXPO_PUBLIC_API_URL_PROD;    

    //const [request, response, promptAsync] = Google.useAuthRequest({
    //    webClientId: clientid,
    //});

    const [request, response, promptAsync] = Google.useAuthRequest({
        //webClientId: '112429908411-ts2vbv871g1cjmb188dd4gsfi8st9o3g.apps.googleusercontent.com',
          webClientId: '112429908411-9bkp7bprjgndtava4ojh799obqol42kr.apps.googleusercontent.com'

    });

    useEffect(() => {
        initializeAuth();
    }, [response]);

    // Adicionar novos métodos para autenticação por email/senha
    const signUpWithEmail = async ({ nome, email, senha }) => {
        try {
            const response = await fetch(`${endpoint}/users/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, email, senha })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro no cadastro');
            }
            
            showAlert('Sucesso', 'Cadastro realizado! Verifique seu email para confirmar.');
            setAuthMode('login');
        } catch (error) {
            showAlert('Erro', error.message);
        }
    };

    const loginWithEmail = async ({ email, senha }) => {
        try {
            const response = await fetch(`${endpoint}/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro no login');
            }

            // Verifica se o token e user estão na resposta
            if (!data.token || !data.user) {
                throw new Error('Resposta do servidor incompleta - faltam token ou user');
            }

            // Cria o objeto userToStore com a mesma estrutura do Google Auth
            const userToStore = {
                ...data.user,
                localData: {
                    accessToken: data.token,
                    lastSync: new Date().toISOString(),
                    backendUserId: data.user._id // Adiciona o ID do backend
                }
            };

            console.log('Preparando userToStore:', JSON.stringify(userToStore, null, 2));

            // Armazena o usuário formatado
            await AsyncStorage.setItem('@user', JSON.stringify(userToStore));
            console.log('Usuário armazenado com sucesso no AsyncStorage');

            setUserInfo(userToStore);

            console.log('Login concluído com sucesso');
            return userToStore;

        } catch (error) {
            //showAlert('Erro', error.message);
            console.error('Erro no loginWithEmail:', error);
            await AsyncStorage.removeItem('@user');
            showAlert('Erro', error.message);
            throw error; // Re-lança o erro para tratamento adicional se necessário
        }
    };

    //const requestPasswordReset = async (email) => {
        // Implementar chamada para endpoint de reset de senha
    //};

    const requestPasswordReset = async (email) => {
        try {
            console.log('Iniciando solicitação de reset de senha para:', email);

            // Validação básica do email
            if (!email || !email.includes('@') || !email.includes('.')) {
                const errorMsg = 'Por favor, informe um email válido';
                console.error(errorMsg);
                throw new Error(errorMsg);
            }

            const response = await fetch(`${endpoint}/users/forgetPassword`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();
            console.log('Resposta do backend para reset de senha:', JSON.stringify(data, null, 2));

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao solicitar reset de senha');
            }

            console.log('Solicitação de reset de senha concluída com sucesso');
            return data;
        } catch (error) {
            console.error('Erro em requestPasswordReset:', error);
            showAlert('Erro', error.message);
            throw error;
        }
    };

    //const deleteAccount = async () => {
        // Implementar chamada para endpoint de remoção de conta
    //};

    const deleteAccount = async () => {
        try {
            // Adiciona confirmação do usuário
            const userConfirmed = await new Promise((resolve) => {
                showAlert(
                    'Confirmação',
                    'Tem certeza que deseja excluir sua conta permanentemente? Esta ação não pode ser desfeita.',
                    [
                        {
                            text: 'Cancelar',
                            onPress: () => resolve(false),
                            style: 'cancel'
                        },
                        {
                            text: 'Excluir',
                            onPress: () => resolve(true),
                            style: 'destructive'
                        }
                    ]
                );
            });

            if (!userConfirmed) {
                console.log('Usuário cancelou a exclusão da conta');
                return { cancelled: true };
            }

            const user = await getLocalUser();
            if (!user) {
                throw new Error('Nenhum usuário logado encontrado');
            }

            console.log('Iniciando processo de exclusão de conta para usuário:', user.email);

            // Verifica se temos um token de acesso válido
            const accessToken = user.localData?.accessToken;
            if (!accessToken) {
                throw new Error('Token de acesso não encontrado');
            }

            const response = await fetch(`${endpoint}/users/deleteAccount`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            const data = await response.json();
            console.log('Resposta do backend para exclusão de conta:', JSON.stringify(data, null, 2));

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao excluir conta');
            }

            // Remove os dados locais após exclusão bem-sucedida
            await AsyncStorage.removeItem('@user');
            setUserInfo(null);

            console.log('Conta excluída com sucesso');

            // Mostra feedback para o usuário
            showAlert('Sucesso', 'Sua conta foi excluída com sucesso');

            return data;
        } catch (error) {
            console.error('Erro em deleteAccount:', error);
            showAlert('Erro', error.message);
            throw error;
        }
    };

    const initializeAuth = async () => {
        const user = await getLocalUser();
        if (!user) {
            if (response?.type === "success") {
                // Primeiro armazena os dados básicos do Google
                const basicUserInfo = await handleGoogleAuth(response.authentication.accessToken);
                setUserInfo(basicUserInfo);

                // Depois sincroniza com backend em segundo plano
                syncWithBackend(basicUserInfo);
            }
        } else {
            setUserInfo(user);
            setIsSyncCompleted(!!user.localData?.syncCompleted); // Carrega estado do AsyncStorage
            // Verifica se precisa sincronizar com backend
            if (!user.localData?.backendUserId) {
                syncWithBackend(user);
            }
        }
        setIsLoading(false);
    };

    const getLocalUser = async () => {
        const data = await AsyncStorage.getItem("@user");
        if (!data) return null;
        return JSON.parse(data);
    };

    const handleGoogleAuth = async (token) => {
        if (!token) return;

        try {
            const googleResponse = await fetch("https://www.googleapis.com/userinfo/v2/me", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!googleResponse.ok) {
                throw new Error(`Google API error: ${googleResponse.status}`);
            }

            const googleUser = await googleResponse.json();

            const userToStore = {
                ...googleUser,
                localData: {
                    accessToken: token,
                    lastSync: new Date().toISOString()
                    // backendUserId será adicionado depois
                }
            };

            await AsyncStorage.setItem('@user', JSON.stringify(userToStore));
            return userToStore;
        } catch (error) {
            console.error('Google authentication failed:', error);
            await AsyncStorage.removeItem('@user');
            throw error;
        }
    };

    const syncWithBackend = async (user) => {

        if (!user || isSyncing || isSyncCompleted) return; // Não executa se já sincronizado

        const now = Date.now();

        // Se for a primeira tentativa, força 5s de espera
        if (isFirstAttempt) {
            setIsFirstAttempt(false);
            setTimeout(() => syncWithBackend(user), 8000);
            return;
        }

        // Para tentativas normais
        if (lastSyncAttempt && now - lastSyncAttempt < 8000) return;

        setLastSyncAttempt(now);
        setIsSyncing(true);

        try {
            const backendUserData = {
                email: user.email,
                nome: user.name || user.email.split('@')[0],
                emailVerificado: user.email_verified,
                profileImage: user.picture,
                googleId: user.sub,
                accessToken: user.localData.accessToken
            };

            const backendUser = await createOrUpdateUserInBackend(backendUserData);

            const updatedUser = {
                ...user,
                localData: {
                    ...user.localData,
                    backendUserId: backendUser._id,
                    lastSync: new Date().toISOString(),
                    syncCompleted: true // Marca como sincronizado
                }
            };

            await AsyncStorage.setItem('@user', JSON.stringify(updatedUser));
            setUserInfo(updatedUser);
            setIsSyncCompleted(true); // Atualiza estado local
            setSyncAttempts(0); // Resetar tentativas após sucesso
        } catch (error) {
            console.error('Backend sync failed:', error);
            setSyncError(true);
            setSyncAttempts(prev => prev + 1); // Incrementar tentativas
        } finally {
            setIsSyncing(false);
            console.log ("Informações de Autenticação sincronizadas com sucesso");
        }
    };

    const createOrUpdateUserInBackend = async (userData) => {
        try {
            const url = `${endpoint}/users/auth/google`;
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            };

            const response = await fetch(url, requestOptions);

            if (!response.ok) {
                const errorResponse = await response.text();
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Backend integration failed:', error);
            throw error;
        }
    };

    const signOut = async () => {
        await AsyncStorage.removeItem('@user');
        setUserInfo(null);
        setIsSyncCompleted(false); // Reseta o estado ao deslogar
    };

    const signIn = () => {
        promptAsync();
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <AuthContext.Provider value={{
            userInfo,
            isLoading,
            syncError,
            isSyncing,
            signIn,
            signOut,
            syncWithBackend, // Expomos a função de sincronização
            authMode,
            setAuthMode,
            signUpWithEmail,
            loginWithEmail,
            requestPasswordReset,
            deleteAccount,
            isRequestingReset, 
            resetEmail
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);