
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert, Platform, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { formatarData, calcularDiferencaDias } from '../utils/dateUtils';

export default function Eventos() {
    const [eventos, setEventos] = useState([]);
    const [favoritos, setFavoritos] = useState([]);
    const [idUser, setIdUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();
    

    const carregarEventos = async () => {
        try {
            const response = await fetch('https://hubleitoresapi.onrender.com/api/v1/eventos');

            if (!response.ok) {
                throw new Error(`Erro na resposta da API: ${response.status}`);
            }

            const data = await response.json();

            if (data && data.data) {
                setEventos(data.data); // Garante que o campo `data` existe
            } else {
                console.warn('Resposta inesperada da API:', data);
            }

        } catch (error) {
            console.error('Erro ao buscar eventos:', error);
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
            const response = await fetch(`https://hubleitoresapi.onrender.com/api/v1/users/${idUser}/favoritos/eventos`);
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
            await carregarEventos();    // Pode ser async
        };
        carregarTudo();
    }, []);

    const confirmarExclusao = (id) => {
        console.log('Clicou em Excluir - ID:', id);

        if (Platform.OS === 'web') {
            const confirmado = window.confirm('Tem certeza que deseja excluir este evento?');
            if (confirmado) excluirEvento(id);
        } else {
            Alert.alert(
                'Confirmar Exclusão',
                'Tem certeza que deseja excluir este evento?',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                        text: 'Excluir',
                        onPress: () => excluirEvento(id),
                        style: 'destructive',
                    },
                ]
            );
        }
    };

    const excluirEvento = (id) => {
        console.log('Enviando requisição DELETE para ID:', id);

        fetch(`https://hubleitoresapi.onrender.com/api/v1/eventos/${id}`, {
            method: 'DELETE'
        })
            .then(res => {
                console.log('Status da resposta:', res.status);
                if (res.ok) {
                    Alert.alert('Sucesso', 'Evento excluído com sucesso!');
                    carregarEventos();
                } else {
                    res.text().then(texto => {
                        console.error('Erro na resposta:', texto);
                        Alert.alert('Erro', 'Não foi possível excluir o evento.');
                    });
                }
            })
            .catch(err => {
                console.error('Erro de rede:', err);
                Alert.alert('Erro', 'Erro de rede ao tentar excluir o evento.');
            });
    };

    const toggleFavorito = async (eventoId) => {
        try {
            console.log('Iniciando toggleFavorito...');
            console.log('ID do usuário:', idUser);
            console.log('ID do evento:', eventoId);

            const response = await fetch(`https://hubleitoresapi.onrender.com/api/v1/users/${idUser}/favoritos/eventos/${eventoId}`, {
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
            const url = `https://hubleitoresapi.onrender.com/api/v1/eventos/${id}/ativo`;
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
            carregarEventos(); // Atualiza a lista
        } catch (error) {
            console.error("Erro ao ativar/desativar:", error);
        }
    };

    const renderItem = ({ item }) => {
        const isFavorito = favoritos.includes(item._id); // Verifica se está na lista de favoritos
        return (
        <View style={styles.card}>
            {/* Imagem do evento à esquerda */}

            {(item.imagemBinaria || item.imagem) && (
                <Image
                    source={{
                        uri: item.imagemBinaria
                            ? `https://hubleitoresapi.onrender.com/api/v1/eventos/${item._id}/imagem` // Cache busting
                            : item.imagem
                    }}
                    style={styles.image}
                    resizeMode="cover"
                    onError={(e) => console.log('Erro ao carregar imagem:', e.nativeEvent.error)}
                />
            )}                    

            <View style={styles.cardContent}>

                <Text style={styles.name}>{item.nome}</Text>
                <Text style={styles.tipoEvento}>{item.tipoEvento}</Text>
                <Text style={styles.info}>Estado: {item.estado}</Text>
                <Text style={styles.info}>Início: {formatarData(item.dataInicial)}</Text>
                {item.dataFinal && <Text style={styles.info}>Término: {formatarData(item.dataFinal)}</Text>}
                <Text style={styles.info2}>Faltam: {calcularDiferencaDias(formatarData(item.dataInicial))} dias.</Text>

                <View style={styles.buttons}>
                    <TouchableOpacity onPress={() => toggleFavorito(item._id)}>
                        <Text style={{ fontSize: 16 }}>
                            {isFavorito ? '❤️' : '🤍'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('EventoDetails', { id: item._id })}>
                        <Text style={styles.link}>Ver</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('EventoForm', { id: item._id })}>
                        <Text style={styles.link}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => confirmarExclusao(item._id)}>
                        <Text style={[styles.link, { color: 'red' }]}>Excluir</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('Programacao', { idEvento: item._id })}>
                        <Text style={styles.link}>Programação</Text>
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
            <FlatList
                data={eventos}
                keyExtractor={item => item._id}
                renderItem={renderItem}
                ListEmptyComponent={<Text style={styles.emptyText}>Nenhum evento encontrado.</Text>}
            />
            <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('EventoForm')}>
                <Text style={styles.addText}>Incluir Novo Evento</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#f5f5f5'
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        marginBottom: 12,
        borderRadius: 8,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    image: {
        width: 100,
        height: '100%',
        backgroundColor: '#e0e0e0'
    },
    cardContent: {
        flex: 1,
        padding: 16,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#2c3e50'
    },
    tipoEvento: {
        fontSize: 14,
        color: '#3498db',
        marginBottom: 8,
        fontWeight: '500'
    },
    info: {
        fontSize: 13,
        marginBottom: 4,
        color: '#555'
    },
    info2: {
        fontSize: 13,
        marginBottom: 4,
        color: '#4a5568',              // Cinza-azulado escuro
        fontWeight: '500',
        borderLeftWidth: 3,            // Borda lateral esquerda
        borderLeftColor: '#3182ce',    // Azul como destaque
        paddingLeft: 8                 // Espaço após a borda
    },
    buttons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 12
    },
    link: {
        color: 'blue',
        paddingVertical: 4,
        paddingHorizontal: 8,
        backgroundColor: '#f0f8ff',
        borderRadius: 4,
        fontSize: 13
    },
    addButton: {
        marginTop: 16,
        backgroundColor: '#3498db',
        padding: 12,
        borderRadius: 8
    },
    addText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold'
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#777'
    }
});


/*
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function Eventos() {
    const [eventos, setEventos] = useState([]);
    const navigation = useNavigation();

    const carregarEventos = () => {
        fetch('https://hubleitoresapi.onrender.com/api/v1/eventos')
            .then(response => response.json())
            .then(response => setEventos(response.data))
            .catch(error => console.error('Erro ao buscar eventos:', error));
    };

    useEffect(() => {
        carregarEventos();
    }, []);

    const confirmarExclusao = (id) => {
        console.log('Clicou em Excluir - ID:', id);

        if (Platform.OS === 'web') {
            const confirmado = window.confirm('Tem certeza que deseja excluir este evento?');
            if (confirmado) excluirEvento(id);
        } else {
            Alert.alert(
                'Confirmar Exclusão',
                'Tem certeza que deseja excluir este evento?',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                        text: 'Excluir',
                        onPress: () => excluirEvento(id),
                        style: 'destructive',
                    },
                ]
            );
        }
    };

    const excluirEvento = (id) => {
        console.log('Enviando requisição DELETE para ID:', id);

        fetch(`https://hubleitoresapi.onrender.com/api/v1/eventos/${id}`, {
            method: 'DELETE'
        })
            .then(res => {
                console.log('Status da resposta:', res.status);
                if (res.ok) {
                    Alert.alert('Sucesso', 'Evento excluído com sucesso!');
                    carregarEventos();
                } else {
                    res.text().then(texto => {
                        console.error('Erro na resposta:', texto);
                        Alert.alert('Erro', 'Não foi possível excluir o evento.');
                    });
                }
            })
            .catch(err => {
                console.error('Erro de rede:', err);
                Alert.alert('Erro', 'Erro de rede ao tentar excluir o evento.');
            });
    };

    const formatarData = (dataString) => {
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR');
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.tipoEvento}</Text>
                <Text style={styles.info}>Estado: {item.estado}</Text>
                <Text style={styles.info}>Início: {formatarData(item.dataInicial)}</Text>
                {item.dataFinal && <Text style={styles.info}>Término: {formatarData(item.dataFinal)}</Text>}

                <View style={styles.buttons}>
                    <TouchableOpacity onPress={() => navigation.navigate('EventoDetails', { id: item._id })}>
                        <Text style={styles.link}>Ver</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('EventoForm', { id: item._id })}>
                        <Text style={styles.link}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => confirmarExclusao(item._id)}>
                        <Text style={[styles.link, { color: 'red' }]}>Excluir</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('Programacao', { idEvento: item._id })}>
                        <Text style={styles.link}>Programação</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            <FlatList
                data={eventos}
                keyExtractor={item => item._id}
                renderItem={renderItem}
                ListEmptyComponent={<Text>Nenhum evento encontrado.</Text>}
            />
            <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('EventoForm')}>
                <Text style={styles.addText}>Incluir Novo Evento</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16 },
    card: {
        backgroundColor: '#fff',
        marginBottom: 12,
        borderRadius: 8,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#3498db'
    },
    info: {
        fontSize: 14,
        marginBottom: 4,
        color: '#555'
    },
    buttons: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 12
    },
    link: {
        marginRight: 12,
        color: 'blue',
        paddingVertical: 4,
        paddingHorizontal: 8,
        backgroundColor: '#f0f8ff',
        borderRadius: 4
    },
    addButton: {
        marginTop: 16,
        backgroundColor: '#3498db',
        padding: 12,
        borderRadius: 8
    },
    addText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold'
    },
});

*/