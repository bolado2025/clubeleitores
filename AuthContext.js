// AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View } from 'react-native';
import showAlert from './utils/alertUtils';


GoogleSignin.configure({
    webClientId: process.env.EXPO_WEB_KEY,
});

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
    const [authType, setAuthType] = useState(null); // 'google' ou 'email' 

    const clientid = process.env.EXPO_PUBLIC_AMBIENTE === 'dev'
        ? process.env.EXPO_PUBLIC_WEB_CLIENT_ID_DEV
        : process.env.EXPO_PUBLIC_WEB_CLIENT_ID_PROD;

    const endpoint = process.env.EXPO_PUBLIC_AMBIENTE === 'dev'
        ? process.env.EXPO_PUBLIC_API_URL_DEV
        : process.env.EXPO_PUBLIC_API_URL_PROD;  

        
    useEffect(() => {
        initializeAuth();
    }, []);

   
    const initializeAuth = async () => {

        console.log("[initializeAuth] Iniciando inicialização da autenticação...");
        const user = await getLocalUser();
        const savedAuthType = await AsyncStorage.getItem('@authType');
        setUserInfo(user);
        setAuthType(savedAuthType);
        setIsLoading(false);        

        /*

        try {
            console.log("[initializeAuth] Buscando usuário no armazenamento local...");
            const user = await getLocalUser();
            console.log("[initializeAuth] Dados do usuário local:", user);
    
            if (user) {
                console.log("[initializeAuth] Usuário encontrado. Atualizando estado...");
                setUserInfo(user);
    
                const isSyncCompleted = !!user.localData?.syncCompleted;
                console.log(`[initializeAuth] Sincronização já concluída? ${isSyncCompleted}`);
                setIsSyncCompleted(isSyncCompleted);
    
                if (!user.localData?.backendUserId) {
                    console.log("[initializeAuth] BackendUserId não encontrado. Iniciando sincronização...");
                    await syncWithBackend(user); // Adicionei 'await' para garantir conclusão
                    console.log("[initializeAuth] Sincronização com backend concluída!");
                } else {
                    console.log("[initializeAuth] Usuário já possui backendUserId. Nenhuma sincronização necessária.");
                }
            } else {
                console.log("[initializeAuth] Nenhum usuário encontrado localmente.");
            }

            
    
        } catch (error) {
            console.error('[initializeAuth] Erro durante a inicialização:', error);
        
        } finally {
            console.log("[initializeAuth] Finalizando processo (loading=false).");
            setIsLoading(false);
        }
        
        */
    };    

    const getLocalUser = async () => {
        const data = await AsyncStorage.getItem('@user');
        return data ? JSON.parse(data) : null;
    };

    //const signIn = () => {
    //    promptAsync();
    //};

    const signIn = async () => {
        try {

          setAuthType('google');
          await AsyncStorage.setItem('@authType', 'google');

          console.log('[GoogleSignIn] Iniciando processo de login...');
          setIsLoading(true);

          console.log('[GoogleSignIn] Verificando serviços do Google Play...');
          await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
          console.log('[GoogleSignIn] Google Play Services disponível.');
      
          console.log('[GoogleSignIn] Iniciando autenticação...');
          await GoogleSignin.signIn();
          console.log('[GoogleSignIn] Autenticação concluída. Buscando dados do usuário...');
      
          const user = await GoogleSignin.getCurrentUser();
          console.log('[GoogleSignIn] Dados do usuário obtidos:', JSON.stringify(user, null, 2));
      
          if (user) {
            const mappedUser = {
              email: user.user.email,
              name: user.user.name,
              picture: user.user.photo,
              sub: user.user.id,
              email_verified: true,
              localData: {
                accessToken: user.idToken,
                lastSync: new Date().toISOString()
              }
            };
      
            console.log('[GoogleSignIn] Usuário mapeado:', JSON.stringify(mappedUser, null, 2));

            setUserInfo(mappedUser);
      
            await AsyncStorage.setItem('@user', JSON.stringify(mappedUser));
            console.log('[GoogleSignIn] Usuário salvo no AsyncStorage.');
      
            //syncWithBackend(mappedUser);
            //console.log('[GoogleSignIn] Processo de sincronização com backend iniciado.');


            const userStored = await AsyncStorage.getItem('@user');
            if (userStored) {
            const parsedUser = JSON.parse(userStored);
            setUserInfo(parsedUser);
            console.log('[GoogleSignIn] Usuário recarregado após salvar:', parsedUser);
            }
            
          } else {
            console.warn('[GoogleSignIn] Nenhum usuário retornado após signIn.');
          }


        } catch (error) {
          console.error('[GoogleSignIn] Erro durante login:', error);
          showAlert('Erro', 'Falha ao fazer login com Google');
        } finally {
          console.log('[GoogleSignIn] Finalizando processo de login.');
          setIsLoading(false);
        }
      };
      

    const signOut = async () => {

        await AsyncStorage.removeItem('@user');
        await AsyncStorage.removeItem('@authType');
        setUserInfo(null);
        setAuthType(null);
        setIsSyncCompleted(false);
    
        if (authType === 'google') {
            try {
                console.log('[signOut] Deslogando do Google...');
                await GoogleSignin.signOut();
            } catch (e) {
                console.warn('Erro ao deslogar do Google:', e);
            }
        } else {
            console.log('[signOut] Logout padrão para login por email.');
        }        

    };


    /*

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

    */

    const syncWithBackend = async (user) => {
        console.log('[syncWithBackend] Iniciando processo de sincronização...');
        console.log('[syncWithBackend] Parâmetros recebidos:', { user, isSyncing, isSyncCompleted });
    
        // 1. Validações iniciais
        if (!user || isSyncing || isSyncCompleted) {
            console.log('[syncWithBackend] Abortando: usuário inválido, já em sincronização ou já sincronizado.');
            return;
        }
    
        const now = Date.now();
        console.log('[syncWithBackend] Timestamp atual:', now);
    
        // 2. Lógica de primeira tentativa (delay de 8s)
        if (isFirstAttempt) {
            console.log('[syncWithBackend] Primeira tentativa. Agendando próxima execução em 8s...');
            setIsFirstAttempt(false);
            setTimeout(() => {
                console.log('[syncWithBackend] Executando primeira tentativa após delay...');
                syncWithBackend(user);
            }, 4000);
            return;
        }
    
        // 3. Limite de tentativas (mínimo 8s entre chamadas)
        if (lastSyncAttempt && now - lastSyncAttempt < 4000) {
            console.log('[syncWithBackend] Abortando: intervalo entre tentativas muito curto.');
            return;
        }
    
        // 4. Prepara para sincronização
        console.log('[syncWithBackend] Iniciando chamada ao backend...');
        setLastSyncAttempt(now);
        setIsSyncing(true);
        console.log('[syncWithBackend] Estados atualizados:', { isSyncing: true, lastSyncAttempt: now });
    
        try {
            // 5. Monta payload para o backend
            const backendUserData = {
                email: user.email,
                name: user.name || user.email.split('@')[0],
                emailVerificado: user.email_verified,
                profileImage: user.picture,
                googleId: user.sub,
                accessToken: user.localData.accessToken
            };
            console.log('[syncWithBackend] Dados enviados ao backend:', backendUserData);
    
            // 6. Chama API do backend
            const backendUser = await createOrUpdateUserInBackend(backendUserData);
            console.log('[syncWithBackend] Resposta do backend:', backendUser);
    
            // 7. Atualiza dados locais
            const updatedUser = {
                ...user,
                localData: {
                    ...user.localData,
                    backendUserId: backendUser._id,
                    lastSync: new Date().toISOString(),
                    syncCompleted: true
                }
            };
            console.log('[syncWithBackend] Dados atualizados locais:', updatedUser);
    
            await AsyncStorage.setItem('@user', JSON.stringify(updatedUser));
            console.log('[syncWithBackend] Dados salvos no AsyncStorage.');
    
            // 8. Atualiza estados globais
            setUserInfo(updatedUser);
            setIsSyncCompleted(true);
            setSyncAttempts(0);
            console.log('[syncWithBackend] Estados globais atualizados:', { 
                syncCompleted: true, 
                syncAttempts: 0 
            });
    
        } catch (error) {
            console.error('[syncWithBackend] Falha na sincronização:', error);
            setSyncError(true);
            setSyncAttempts(prev => {
                const newAttempts = prev + 1;
                console.log(`[syncWithBackend] Tentativa ${newAttempts} falhou.`);
                return newAttempts;
            });
        } finally {
            setIsSyncing(false);
            console.log('[syncWithBackend] Sincronização concluída (sucesso ou falha). Estado:', { isSyncing: false });
        }
    };

    const syncWithBackendnoDelay = async (user) => {

       // if (isFirstAttempt) {

            console.log('[syncWithBackend] Iniciando processo de sincronização...');
            console.log('[syncWithBackend] Parâmetros recebidos:', { user, isSyncing, isSyncCompleted });
        
            // 1. Validações iniciais
            //if (!user || isSyncing || isSyncCompleted) {
            //    console.log('[syncWithBackend] Abortando: usuário inválido, já em sincronização ou já sincronizado.');
            //    return;
            // }
        
            // 2. Prepara para sincronização
            console.log('[syncWithBackend] Iniciando chamada ao backend...');
            //setIsSyncing(true);
            //setLastSyncAttempt(Date.now());
            //console.log('[syncWithBackend] Estados atualizados:', { isSyncing: true });
        
            try {
                // 3. Monta payload para o backend
                const backendUserData = {
                    email: user.email,
                    nome: user.name || user.email.split('@')[0],
                    emailVerificado: user.email_verified,
                    profileImage: user.picture,
                    googleId: user.sub,
                    //accessToken: user.localData.accessToken 
                    accessToken: user.accessToken 
                };
                console.log('[syncWithBackend] Dados enviados ao backend:', backendUserData);
        
                // 4. Chama API do backend
                const backendUser = await createOrUpdateUserInBackend(backendUserData);
                console.log('[syncWithBackend] Resposta do backend:', backendUser);
        
                // 5. Atualiza dados locais
                const updatedUser = {
                    ...user,
                    localData: {
                        ...user.localData,
                        backendUserId: backendUser._id,
                        lastSync: new Date().toISOString(),
                        syncCompleted: true
                    }
                };
                console.log('[syncWithBackend] Dados atualizados locais:', updatedUser);
        
                await AsyncStorage.setItem('@user', JSON.stringify(updatedUser));
                console.log('[syncWithBackend] Dados salvos no AsyncStorage.');
        
                // 6. Atualiza estados globais
                setUserInfo(updatedUser);
                //setIsSyncCompleted(true);
                //setSyncAttempts(0);
                //console.log('[syncWithBackend] Estados globais atualizados:', { 
                //    syncCompleted: true, 
                //    syncAttempts: 0 
                //});
                
        
            } catch (error) {
                console.error('[syncWithBackend] Falha na sincronização:', error);
                //setSyncError(true);
                //setSyncAttempts(prev => {
                //    const newAttempts = prev + 1;
                //    console.log(`[syncWithBackend] Tentativa ${newAttempts} falhou.`);
                //    return newAttempts;
                //});
            } finally {
                //setIsSyncing(false);
                console.log('[syncWithBackend] Sincronização concluída. Estado:', { isSyncing: false });
            }

        //}    
    };

    /*const initializeAuth = async () => {
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
    };*/    

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

            setAuthType('email');
            await AsyncStorage.setItem('@authType', 'email');

            console.log(`Tentando login em: ${endpoint}/users/login`);
            console.log('Payload:', JSON.stringify({ email, senha }));
    
            const response = await fetch(`${endpoint}/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha })
            });
    
            // Log do status e headers da resposta
            console.log(`Status da resposta: ${response.status}`);
            console.log('Headers:', JSON.stringify([...response.headers]));
    
            // Verificar o tipo de conteúdo antes de fazer parse
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const textResponse = await response.text();
                console.error('Resposta não é JSON:', textResponse);
                throw new Error(`Resposta inesperada do servidor: ${textResponse.substring(0, 100)}`);
            }
    
            const data = await response.json();
            console.log('Resposta JSON:', JSON.stringify(data, null, 2));
    
            if (!response.ok) {
                throw new Error(data.message || `Erro no login (${response.status})`);
            }
    
            if (!data.token || !data.user) {
                throw new Error('Resposta do servidor incompleta - faltam token ou user');
            }
    
            const userToStore = {
                ...data.user,
                localData: {
                    accessToken: data.token,
                    lastSync: new Date().toISOString(),
                    backendUserId: data.user._id
                }
            };
    
            console.log('Preparando userToStore:', JSON.stringify(userToStore, null, 2));
            await AsyncStorage.setItem('@user', JSON.stringify(userToStore));
            console.log('Usuário armazenado com sucesso no AsyncStorage');
    
            setUserInfo(userToStore);
            console.log('Login concluído com sucesso');

            return userToStore;
    
        } catch (error) {
            console.error('Erro completo no loginWithEmail:', {
                message: error.message,
                stack: error.stack,
                endpoint: `${endpoint}/users/login`
            });
            await AsyncStorage.removeItem('@user');
            showAlert('Erro', error.message);
            throw error;
        }
    };

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
            syncWithBackendnoDelay,
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