// components/CustomHeader.js

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions, Modal, Pressable, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../AuthContext';

export default function CustomHeader() {
    const navigation = useNavigation();
    const route = useRoute();
    const [isMobile, setIsMobile] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const { userInfo, isLoading, isSyncing, signIn, signOut, syncWithBackend, syncError } = useAuth();

    useEffect(() => {
        const checkScreenSize = () => {
            const { width } = Dimensions.get('window');
            setIsMobile(width < 768); // 768px é um breakpoint comum para tablets/desktops
        };
        // Verificar no carregamento inicial
        checkScreenSize();

        // Adicionar listener para mudanças de tamanho
        Dimensions.addEventListener('change', checkScreenSize);

        // Limpar listener ao desmontar
        return () => {
            Dimensions.removeEventListener('change', checkScreenSize);
        };
    }, []);

   
    // Substitua o useEffect por:
    useEffect(() => {
        // Só tenta sincronizar se:
        // 1. Há usuário logado
        // 2. Não está sincronizando no momento
        // 3. A sincronização nunca foi completada
        // 4. Não há backendUserId registrado
        const shouldSync = userInfo &&
            !isSyncing &&
            !userInfo.localData?.syncCompleted &&
            !userInfo.localData?.backendUserId;

        if (shouldSync) {
            const timer = setTimeout(() => {
                syncWithBackend(userInfo);
            }, 16000); // Reduzi o tempo para 5s como exemplo

            return () => clearTimeout(timer);
        }
    }, [userInfo?.localData?.syncCompleted, userInfo?.localData?.backendUserId]);   

    const getStyle = (screen) => [
        styles.link,
        route.name === screen && styles.activeLink
    ];

    const menuItems = [
        { name: 'Home', label: 'HomeScreen' },
        { name: 'AutorList', label: 'Autores' },
        { name: 'Search', label: 'Busca' },
        { name: 'Calendario', label: 'Calendário' },
        { name: userInfo ? 'Perfil' : 'Login', label: userInfo ? 'Perfil' : 'Login' },
    ];

    // E na função renderMenuItem:
    const renderMenuItem = (item, isModal = false) => (
        <TouchableOpacity
            onPress={() => {
                navigation.navigate(item.name);
                if (isModal) setMenuVisible(false);
            }}
            style={isModal ? styles.modalMenuItem : null}
        >
            <Text style={isModal ?
                (route.name === item.name ? styles.activeModalMenuText : styles.modalMenuText) :
                getStyle(item.name)}>
                {item.label}
            </Text>
        </TouchableOpacity>
    );    

    return (
        <View style={styles.header}>
            {/* Mostrar indicador de sincronização quando estiver sincronizando */}
            {syncError && (
                <View style={styles.errorIndicator}>
                    <Ionicons name="warning" size={16} color="#ff6b6b" />
                    <Text style={styles.errorText}>Erro na sincronização</Text>
                </View>
            )}
            {isSyncing && (
                <View style={styles.syncIndicator}>
                    <ActivityIndicator size="small" color="#ffffff" />
                    <Text style={styles.syncText}>Sincronizando...</Text>
                </View>
            )}

            {/* Botão de voltar quando aplicável */}
            {['Eventos', 'Programacao', 'AutorPublishings', 'UserList', 'ClippingList'].includes(route.name) && (
                <TouchableOpacity onPress={() => navigation.navigate('AutorList')} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#ecf0f1" />
                </TouchableOpacity>
            )}

            {/* Menu para desktop */}
            {!isMobile && (
                <View style={styles.desktopMenu}>
                    {menuItems.map(item => renderMenuItem(item))}
                </View>
            )}

            {/* Menu para mobile */}
            {isMobile && (
                <View style={styles.mobileMenuContainer}>
                    <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuButton}>
                        <Ionicons name="menu" size={28} color="#ecf0f1" />
                    </TouchableOpacity>

                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={menuVisible}
                        onRequestClose={() => setMenuVisible(false)}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalMenu}>
                                <Pressable
                                    style={styles.closeButton}
                                    onPress={() => setMenuVisible(false)}
                                >
                                    <Ionicons name="close" size={28} color="#3498db" />
                                </Pressable>

                                {menuItems.map(item => renderMenuItem(item, true))}

                                {/* Área do usuário no menu mobile */}
                                <View style={styles.userAreaMobile}>
                                    {userInfo?.picture && (
                                        <Image source={{ uri: userInfo.picture }} style={styles.userImage} />
                                    )}
                                    <TouchableOpacity
                                        onPress={() => {
                                            signOut();
                                            setMenuVisible(false);
                                        }}
                                        style={styles.signOutButtonMobile}
                                    >
                                        <Ionicons name="log-out-outline" size={20} color="#3498db" />
                                        <Text style={styles.signOutText}>Sair</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                </View>
            )}

            {/* Área do usuário (apenas para desktop) */}
            {!isMobile && (
                <View style={styles.userArea}>
                    {userInfo?.picture && (
                        <Image source={{ uri: userInfo.picture }} style={styles.userImage} />
                    )}
                    <TouchableOpacity onPress={signOut} style={styles.signOutButton}>
                        <Ionicons name="log-out-outline" size={20} color="#ecf0f1" />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#3498db',
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    desktopMenu: {
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'center',
        gap: 20,
    },
    mobileMenuContainer: {
        flex: 1,
        alignItems: 'flex-start',
    },
    menuButton: {
        padding: 5,
    },
    link: {
        color: '#ecf0f1',
        fontSize: 16,
    },
    activeLink: {
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
    backButton: {
        marginRight: 10,
    },
    userArea: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userImage: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 10,
    },
    signOutButton: {
        marginLeft: 10,
    },
    // Estilos para o menu modal mobile
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-start',
    },
    modalMenu: {
        backgroundColor: 'white',
        width: '70%',
        height: '100%',
        padding: 20,
    },    
    closeButton: {
        alignSelf: 'flex-end',
        marginBottom: 20,
    },
    modalMenuItem: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    userAreaMobile: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 30,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    signOutButtonMobile: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 10,
    },
    signOutText: {
        marginLeft: 5,
        color: '#3498db',
    },
    modalMenuText: {
        color: '#2c3e50', // Cor escura para boa legibilidade
        fontSize: 16,
    },
    activeModalMenuText: {
        color: '#3498db', // Cor azul para o item ativo
        fontWeight: 'bold',
    },
    syncIndicator: {
        position: 'absolute',
        top: 5,
        right: 5,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 5,
        borderRadius: 10,
    },
    syncText: {
        color: '#ffffff',
        fontSize: 12,
        marginLeft: 5,
    },
    errorIndicator: {
        position: 'absolute',
        top: 5,
        right: 5,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 5,
        borderRadius: 10,
    },
    errorText: {
        color: '#ff6b6b',
        fontSize: 12,
        marginLeft: 5,
    },
});







/*
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function CustomHeader({ userInfo, onSignOut }) {
    const navigation = useNavigation();
    const route = useRoute();

    

    const getStyle = (screen) => [
        styles.link,
        route.name === screen && styles.activeLink
    ];

    return (
        <View style={styles.header}>

            {['Eventos', 'Programacao', 'AutorPublishings', 'UserList', 'ClippingList'].includes(route.name) && (
                <TouchableOpacity onPress={() => navigation.navigate('AutorList')} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#ecf0f1" />
                </TouchableOpacity>
            )}

     
            <TouchableOpacity onPress={() => navigation.navigate('EndPoints')}>
                <Text style={getStyle('EndPoints')}>EndPoints</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('AutorList')}>
                <Text style={getStyle('AutorList')}>Autores&Obras</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Eventos')}>
                <Text style={getStyle('Eventos')}>Eventos&Prog.</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('UserList')}>
                <Text style={getStyle('UserList')}>Usuários</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('ClippingList')}>
                <Text style={getStyle('ClippingList')}>Clippings</Text>
            </TouchableOpacity>            


            <View style={styles.userArea}>
                {userInfo?.picture && (
                    <Image source={{ uri: userInfo.picture }} style={styles.userImage} />
                )}
                <TouchableOpacity onPress={onSignOut} style={styles.signOutButton}>
                    <Ionicons name="log-out-outline" size={20} color="#ecf0f1" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#3498db',
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    link: {
        color: '#ecf0f1',
        fontSize: 16,
    },
    activeLink: {
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
    backButton: {
        marginRight: 10,
    },
    userArea: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    userImage: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 10,
    },
    signOutButton: {
        marginLeft: 10,
    },
});

*/







/*
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; // ← ícone de seta

export default function CustomHeader() {
    const navigation = useNavigation();
    const route = useRoute();

    const getStyle = (screen) => [
        styles.link,
        route.name === screen && styles.activeLink
    ];

    return (
        <View style={styles.header}>
    
            {['Eventos', 'Programacao', 'AutorPublishings', 'UserList', 'ClippingList'].includes(route.name) && (
                <TouchableOpacity onPress={() => navigation.navigate('AutorList')} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#ecf0f1" />
                </TouchableOpacity>
            )}

                                          
            {['ObraDetalhes', 'ObraForm', 'AutorDetails', 'AutorForm', 'EventoDetails', 'ProgramacaoForm', 'UserForm', 'ClippingForm', 'ProgramacaoDetails'].includes(route.name) && (
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#ecf0f1" />
                </TouchableOpacity>
            )}

            <TouchableOpacity onPress={() => navigation.navigate('EndPoints')}>
                <Text style={getStyle('EndPoints')}>EndPoints</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('AutorList')}>
                <Text style={getStyle('AutorList')}>Autores&Obras</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Eventos')}>
                <Text style={getStyle('Eventos')}>Eventos&Prog.</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('UserList')}>
                <Text style={getStyle('UserList')}>Usuários</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('ClippingList')}>
                <Text style={getStyle('ClippingList')}>Clippings</Text>
            </TouchableOpacity>

        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: '#3498db',
        paddingVertical: 10,
        paddingHorizontal: 10,
    },
    link: {
        color: '#ecf0f1',
        fontSize: 16,
        marginHorizontal: 5,
    },
    activeLink: {
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
    backButton: {
        marginRight: 10,
    },
});

*/


/*import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function CustomHeader() {
    const navigation = useNavigation();
    const route = useRoute();

    const getStyle = (screen) => [
        styles.link,
        route.name === screen && styles.activeLink
    ];

    return (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.navigate('AutorList')}>
                <Text style={getStyle('AutorList')}>Autores</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Eventos')}>
                <Text style={getStyle('Eventos')}>Eventos</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Programacao')}>
                <Text style={getStyle('Programacao')}>Programação</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#3498db',
        paddingVertical: 10,
    },
    link: {
        color: '#ecf0f1',
        fontSize: 16,
    },
    activeLink: {
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
});*/
