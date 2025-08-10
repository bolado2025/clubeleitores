
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, Alert, StyleSheet, Platform,ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import showAlert from '../utils/alertUtils';

const CustomImage = ({ source, style }) => {
    if (Platform.OS === 'web') {
        return <img src={source.uri} style={style} alt="Autor" />;
    }
    return <Image source={source} style={style} />;
};

const AutorImage = ({ autor }) => {
    // Prioriza a imagem de link externo
    if (autor.image) {
        return <CustomImage source={{ uri: autor.image }} style={styles.autorImage} />;
    }

    // Se não tiver link externo, mas tiver imagem armazenada
    if (autor.imageData?.base64) {
        const uri = `data:${autor.imageData.contentType};base64,${autor.imageData.base64}`;
        return <CustomImage source={{ uri }} style={styles.autorImage} />;
    }

    // Placeholder se não tiver imagem
    return (
        <View style={styles.autorImagePlaceholder}>
            <Text style={styles.placeholderText}>Foto</Text>
        </View>
    );
};

export default function AutorList() {
    const [autores, setAutores] = useState([]);
    const [favoritos, setFavoritos] = useState([]);
    const [idUser, setIdUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    const carregarAutores = async () => {
        try {
            setLoading(true);
            const response = await fetch('https://hubleitoresapi.onrender.com/api/v1/autores');
            const data = await response.json();
            setAutores(data.data);
        } catch (error) {
            console.error('Erro ao buscar autores:', error);
        } finally {
            setLoading(false);
        }
    };

    const carregarFavoritos = async (idUser) => {
        try {
            setLoading(true);
            console.log("Id do Usuario logado ------------------------> ", idUser);

            if (!idUser) {
                console.warn("ID do usuário ainda não definido.");
                return;
            }
            const response = await fetch(`https://hubleitoresapi.onrender.com/api/v1/users/${idUser}/favoritos/autores`);
            const data = await response.json();
            setFavoritos(data);
        } catch (error) {
            console.error('Erro ao buscar favoritos:', error);
        } finally {
            setLoading(false);
        }
    };

    const recuperarIdUsuario = async () => {
    try {
        const user = await AsyncStorage.getItem('@user');
        verifyUserIdWithBackend(JSON.parse(user));      
    } catch (error) {
        console.error('Erro ao recuperar usuário do AsyncStorage:', error);
    }
    };

    const verifyUserIdWithBackend = async (user) => {
        try {
            console.log('Iniciando verificação de usuário com o backend...');
            console.log('Usuário recuperado do AsyncStorage:', user);
            const requestBody = { email: user.email };
            console.log('Payload da requisição:', requestBody);

            const response = await fetch('https://hubleitoresapi.onrender.com/api/v1/users/verifyUserId', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.accessToken}`
                },
                body: JSON.stringify(requestBody)
            });

            console.log('Status da resposta:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Erro na resposta da API:', errorText);
                throw new Error('User verification failed');
            }

            const data = await response.json();
            console.log('Dados retornados da API:', data);

            if (data.userId) {
                console.log('ID do usuário retornado pela API:', data.userId);
                setIdUser(data.userId);
                carregarFavoritos(data.userId);
            } else {
                console.warn('Resposta da API não contém userId');
            }

        } catch (error) {
            console.error('Erro ao verificar o usuário:', error);
            await AsyncStorage.removeItem('@user');
            //setUserInfo(null);
        }
    };       

    useEffect(() => {
        const carregarTudo = async () => {
            await recuperarIdUsuario(); // Aguarda recuperar o ID
            await carregarAutores();    // Pode ser async
        };
        carregarTudo();
    }, []);

    const confirmarExclusao = (id) => {
        showAlert(
            'Confirmar Exclusão',
            'Tem certeza que deseja excluir este autor?',
            [
                {
                    text: 'Cancelar',
                    style: 'cancel'
                },
                {
                    text: 'Excluir',
                    onPress: () => excluirAutor(id),
                    style: 'destructive',
                }
            ]
        );
    };

    const excluirAutor = (id) => {
        fetch(`https://hubleitoresapi.onrender.com/api/v1/autores/${id}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (response.ok) {
                    showAlert('Sucesso', 'Autor excluído com sucesso!');
                    carregarAutores();
                } else {
                    showAlert('Erro', 'Não foi possível excluir o autor.');
                }
            })
            .catch(error => {
                console.error('Erro:', error);
                showAlert('Erro', 'Ocorreu um erro ao tentar excluir o autor.');
            });
    };

    const toggleFavorito = async (autorId) => {
        try {
            console.log('Iniciando toggleFavorito...');
            console.log('ID do usuário:', idUser);
            console.log('ID do autor:', autorId);

            const response = await fetch(`https://hubleitoresapi.onrender.com/api/v1/users/${idUser}/favoritos/autores/${autorId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.log('Resposta da requisição:', response);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Erro no fetch:', errorData);
                throw new Error('Erro ao atualizar favoritos');
            }

            const data = await response.json();
            console.log('Nova lista de favoritos recebida:', data);
            setFavoritos(data); // Atualiza com a nova lista de favoritos
        } catch (error) {
            console.error('Erro ao atualizar favoritos (try/catch):', error);
        }
    };
    
    const toggleAtivo = async (id, ativoAtual) => {
        try {
            const url = `https://hubleitoresapi.onrender.com/api/v1/autores/${id}/ativo`;
            const payload = { ativo: !ativoAtual };

            console.log('🔄 Requisição PATCH para:', url);
            console.log('📦 Payload:', payload);

            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const responseBody = await response.text(); // capturar como texto (pode não ser JSON válido)

            if (!response.ok) {
                console.error(`❌ Erro ${response.status} - ${response.statusText}`);
                console.error('📥 Corpo da resposta de erro:', responseBody);
                throw new Error(`Erro na resposta do servidor: ${response.status}`);
            }

            console.log('✅ Status ativo atualizado com sucesso');
            carregarAutores(); // Atualiza a lista
        } catch (error) {
            console.error("Erro ao ativar/desativar:", error);
        }
    };
    

    const renderItem = ({ item }) => {
        const isFavorito = favoritos.includes(item._id); // Verifica se está na lista de favoritos

        return (
            <View style={styles.card}>
                <TouchableOpacity onPress={() => navigation.navigate('AutorDetails', { id: item._id })}>
                    <AutorImage autor={item} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{item.nome}</Text>
                    <View style={styles.buttons}>
                        <TouchableOpacity onPress={() => toggleFavorito(item._id)}>
                            <Text style={{ fontSize: 16 }}>
                                {isFavorito ? '❤️' : '🤍'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => navigation.navigate('AutorDetails', { id: item._id })}>
                            <Text style={styles.link}>Ver</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('AutorForm', { id: item._id })}>
                            <Text style={styles.link}>Editar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => confirmarExclusao(item._id)}>
                            <Text style={[styles.link, { color: 'red' }]}>Excluir</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.navigate('AutorPublishings', { idAutor: item._id })}>
                            <Text style={styles.link}>Obras do Autor(a)</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => toggleAtivo(item._id, item.ativo)}
                            style={{ flexDirection: 'row', alignItems: 'center' }}
                        >
                            <Text
                                style={{
                                    marginRight: 8,
                                    color: item.ativo ? 'green' : 'red',
                                    fontWeight: 'bold',
                                }}
                            >
                                {item.ativo ? 'Status Ativo' : 'Status Inativo'}
                            </Text>
                            <Text style={{ fontSize: 16 }}>
                                {item.ativo ? '🟢' : '🔴'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };
    

    return (
        <ScrollView style={styles.container}>
            {loading ? (
                <Text style={styles.loadingText}>Carregando autores...</Text>
            ) : (
                <FlatList
                    data={autores}
                    keyExtractor={item => item._id}
                    renderItem={renderItem}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>Nenhum autor encontrado</Text>
                    }
                    contentContainerStyle={styles.listContent}
                />
            )}

            <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('AutorForm')}
            >
                <Text style={styles.addText}>Adicionar Novo Autor</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({

    autorImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginRight: 15,
    },
    autorImagePlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginRight: 15,
        backgroundColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        color: '#666',
    },
    cardContent: {
        flex: 1,
    },
    autorNome: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    autorBio: {
        color: '#666',
        marginBottom: 10,
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    button: {
        backgroundColor: '#3498db',
        padding: 8,
        borderRadius: 4,
        marginLeft: 10,
    },
    buttonText: {
        color: '#fff',
    },
    addButton: {
        backgroundColor: '#2ecc71',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    loadingText: {
        textAlign: 'center',
        marginTop: 20,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#666',
    },
    listContent: {
        paddingBottom: 20,
    },
    container: { padding: 16 },
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        marginBottom: 12,
        borderRadius: 8,
        padding: 10,
        alignItems: 'center'
    },
    image: { width: 60, height: 60, borderRadius: 30, marginRight: 12 },
    name: { fontSize: 18, fontWeight: 'bold' },
    buttons: { flexDirection: 'row', gap: 10, marginTop: 8 },
    link: { color: 'blue', marginRight: 10 },
    addButton: { marginTop: 16, backgroundColor: '#3498db', padding: 12, borderRadius: 8 },
    addText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' }
});

/*

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function AutorList() {
    const [autores, setAutores] = useState([]);
    const navigation = useNavigation();

    const carregarAutores = () => {
        fetch('https://hubleitoresapi.onrender.com/api/v1/autores')
            .then(response => response.json())
            .then(response => setAutores(response.data))
            .catch(error => console.error('Erro ao buscar autores:', error));
    };

    useEffect(() => {
        carregarAutores();
    }, []);

    const confirmarExclusao = (id) => {
        console.log('Clicou em Excluir - ID:', id);

        if (Platform.OS === 'web') {
            const confirmado = window.confirm('Tem certeza que deseja excluir este autor?');
            if (confirmado) excluirAutor(id);
        } else {
            Alert.alert(
                'Confirmar Exclusão',
                'Tem certeza que deseja excluir este autor?',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                        text: 'Excluir',
                        onPress: () => excluirAutor(id),
                        style: 'destructive',
                    },
                ]
            );
        }
    };

    const excluirAutor = (id) => {
        console.log('Enviando requisição DELETE para ID:', id);

        fetch(`https://hubleitoresapi.onrender.com/api/v1/autores/${id}`, {
            method: 'DELETE'
        })
            .then(res => {
                console.log('Status da resposta:', res.status);
                if (res.ok) {
                    Alert.alert('Sucesso', 'Autor excluído com sucesso!');
                    carregarAutores();
                } else {
                    res.text().then(texto => {
                        console.error('Erro na resposta:', texto);
                        Alert.alert('Erro', 'Não foi possível excluir o autor.');
                    });
                }
            })
            .catch(err => {
                console.error('Erro de rede:', err);
                Alert.alert('Erro', 'Erro de rede ao tentar excluir o autor.');
            });
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <TouchableOpacity onPress={() => navigation.navigate('AutorDetails', { id: item._id })}>
                <Image source={{ uri: item.image }} style={styles.image} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.nome}</Text>
                <View style={styles.buttons}>
                    <TouchableOpacity onPress={() => navigation.navigate('AutorDetails', { id: item._id })}>
                        <Text style={styles.link}>Ver</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('AutorForm', { id: item._id })}>
                        <Text style={styles.link}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => confirmarExclusao(item._id)}>
                        <Text style={[styles.link, { color: 'red' }]}>Excluir</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('AutorPublishings', { idAutor: item._id })}>
                        <Text style={styles.link}>Obras do Autor(a)</Text>
                    </TouchableOpacity>                    
                </View>
            </View>
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            <FlatList
                data={autores}
                keyExtractor={item => item._id}
                renderItem={renderItem}
                ListEmptyComponent={<Text>Nenhum autor encontrado.</Text>}
            />
            <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AutorForm')}>
                <Text style={styles.addText}>Incluir Novo Autor</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16 },
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        marginBottom: 12,
        borderRadius: 8,
        padding: 10,
        alignItems: 'center'
    },
    image: { width: 60, height: 60, borderRadius: 30, marginRight: 12 },
    name: { fontSize: 18, fontWeight: 'bold' },
    buttons: { flexDirection: 'row', gap: 10, marginTop: 8 },
    link: { marginRight: 12, color: 'blue' },
    addButton: { marginTop: 16, backgroundColor: '#3498db', padding: 12, borderRadius: 8 },
    addText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
});

*/