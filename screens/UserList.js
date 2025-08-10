import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, Image as RNImage, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function UserList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    const CustomImage = ({ source, style }) => {
        if (Platform.OS === 'web') {
            // Solução para web
            const img = new window.Image();
            img.src = source.uri;
            return <img src={source.uri} style={style} alt="Profile" />;
        }

        // Solução padrão para mobile
        return <RNImage source={source} style={style} />;
    };

  
    const UserProfileImage = ({ imageData }) => {
        if (!imageData?.base64) {
            return (
                <View style={styles.userImagePlaceholder}>
                    <Text style={styles.placeholderText}>Foto</Text>
                </View>
            );
        }

        // ⚠️ Corrige contentType inválido
        const contentType = imageData.contentType?.includes('/')
            ? imageData.contentType
            : `image/${imageData.contentType || 'jpeg'}`;

        const uri = `data:${contentType};base64,${imageData.base64}`;

        return (
            <CustomImage
                source={{ uri }}
                style={styles.userImage}
            />
        );
    };
    
    const carregarUsuarios = () => {
        setLoading(true);
        fetch('https://hubleitoresapi.onrender.com/api/v1/users?sort=-updatedAt')
            .then(response => response.json())
            .then(response => {
                console.log('Dados recebidos:', response); // Adiciona log dos dados brutos
                console.log('Primeiro usuário:', response.data[0]); // Log do primeiro usuário
                console.log('Tipo de updatedAt:', typeof response.data[0]?.alteradoEm); // Verifica o tipo

                // Verifica se é string e tenta parsear
                if (response.data[0]?.alteradoEm) {
                    console.log('Data parseada:', new Date(response.data[0].alteradoEm));
                }

                setUsers(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Erro ao buscar usuários:', error);
                setLoading(false);
            });
    };

    useEffect(() => {
        carregarUsuarios();
    }, []);

    const formatarData = (dataString) => {
        if (!dataString) return 'Nunca acessou';

        try {
            const options = {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            };
            return new Date(dataString).toLocaleDateString('pt-BR', options);
        } catch (e) {
            return 'Data inválida';
        }
    };

    // Função de formatação segura para datas
    const safeFormatDate = (dateValue) => {

        console.log(dateValue);

        if (!dateValue) return 'Nunca acessou';

        try {
            // Se for objeto MongoDB BSON date
            if (dateValue instanceof Object && dateValue.$date) {
                return new Date(dateValue.$date).toLocaleString();
            }
            // Se já for objeto Date
            if (dateValue instanceof Date) {
                return dateValue.toLocaleString();
            }
            // Se for string ISO
            return new Date(dateValue).toLocaleString();
        } catch (e) {
            console.warn('Erro ao formatar data:', dateValue, e);
            return 'Data inválida';
        }
    };

    const confirmarExclusao = (id) => {
        Alert.alert(
            'Confirmar Exclusão',
            'Tem certeza que deseja excluir este usuário?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    onPress: () => excluirUsuario(id),
                    style: 'destructive',
                },
            ]
        );
    };

    const excluirUsuario = (id) => {
        fetch(`https://hubleitoresapi.onrender.com/api/v1/users/${id}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (response.ok) {
                    Alert.alert('Sucesso', 'Usuário excluído com sucesso!');
                    carregarUsuarios();
                } else {
                    Alert.alert('Erro', 'Não foi possível excluir o usuário.');
                }
            })
            .catch(error => {
                console.error('Erro:', error);
                Alert.alert('Erro', 'Ocorreu um erro ao tentar excluir o usuário.');
            });
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            {/* Adicione a imagem no início do card */}
            <UserProfileImage imageData={item.profileImage} />

            <View style={styles.cardContent}>
                <Text style={styles.userName}>{item.nome}</Text>
                <Text style={styles.userEmail}>{item.email}</Text>
                <Text style={styles.userInfo}>
                    Autores favoritos: {item.autoresFavoritos?.length || 0}
                </Text>
                <Text style={styles.userInfo}>
                    Eventos favoritos: {item.eventosFavoritos?.length || 0}
                </Text>
                <Text style={styles.lastAccess}>
                    Último acesso: {formatarData(item.alteradoEm)}
                </Text>

                <View style={styles.buttons}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => navigation.navigate('UserForm', { userId: item._id })}
                    >
                        <Text style={styles.buttonText}>Ver/Editar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: '#e74c3c' }]}
                        onPress={() => confirmarExclusao(item._id)}
                    >
                        <Text style={styles.buttonText}>Excluir</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {loading ? (
                <Text style={styles.loadingText}>Carregando usuários...</Text>
            ) : (
                <FlatList
                    data={users}
                    keyExtractor={item => item._id}
                    renderItem={renderItem}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>Nenhum usuário encontrado</Text>
                    }
                    contentContainerStyle={styles.listContent}
                />
            )}

            <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('UserForm')}
            >
                <Text style={styles.addButtonText}>Adicionar Novo Usuário</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5'
    },
    listContent: {
        paddingBottom: 20
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2
    },
    userImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 12
    },
    cardContent: {
        flex: 1
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4
    },
    userEmail: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4
    },
    userInfo: {
        fontSize: 12,
        color: '#888',
        marginBottom: 2
    },
    buttons: {
        flexDirection: 'row',
        marginTop: 8,
        justifyContent: 'flex-end'
    },
    button: {
        backgroundColor: '#3498db',
        padding: 8,
        borderRadius: 4,
        marginLeft: 8,
        minWidth: 80,
        alignItems: 'center'
    },
    buttonText: {
        color: '#fff',
        fontSize: 14
    },
    addButton: {
        backgroundColor: '#2ecc71',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16
    },
    loadingText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#888'
    },
    lastAccess: {
        fontSize: 12,
        color: '#888',
        fontStyle: 'italic',
        marginTop: 4
    },
    userImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 12,
        backgroundColor: '#e1e1e1'
    },
    userImagePlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 12,
        backgroundColor: '#e1e1e1',
        justifyContent: 'center',
        alignItems: 'center'
    },
    placeholderText: {
        color: '#888',
        fontSize: 12
    },
    // Ajuste o cardContent para compensar a imagem
    cardContent: {
        flex: 1,
        marginLeft: 12
    }    
});