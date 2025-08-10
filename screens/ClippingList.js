import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function ClippingList() {
    const [clippings, setClippings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const navigation = useNavigation();

    const carregarClippings = () => {
        setRefreshing(true);
        fetch('https://hubleitoresapi.onrender.com/api/v1/clippings')
            .then(response => response.json())
            .then(response => {
                setClippings(response.data);
                setLoading(false);
                setRefreshing(false);
            })
            .catch(error => {
                console.error('Erro ao buscar clippings:', error);
                setLoading(false);
                setRefreshing(false);
            });
    };

    useEffect(() => {
        carregarClippings();
    }, []);

    const confirmarExclusao = (id) => {
        Alert.alert(
            'Confirmar Exclusão',
            'Tem certeza que deseja excluir este clipping?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    onPress: () => excluirClipping(id),
                    style: 'destructive',
                },
            ]
        );
    };

    const excluirClipping = (id) => {
        fetch(`https://hubleitoresapi.onrender.com/api/v1/clippings/${id}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (response.ok) {
                    Alert.alert('Sucesso', 'Clipping excluído com sucesso!');
                    carregarClippings();
                } else {
                    Alert.alert('Erro', 'Não foi possível excluir o clipping.');
                }
            })
            .catch(error => {
                console.error('Erro:', error);
                Alert.alert('Erro', 'Ocorreu um erro ao tentar excluir o clipping.');
            });
    };

    const formatarData = (dataString) => {
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR');
    };

    const renderItem = ({ item }) => (
        <View style={[
            styles.card,
            !item.status && styles.inactiveCard
        ]}>
            <Text style={styles.titulo}>{item.titulo}</Text>
            <Text style={styles.periodo}>{item.periodo}</Text>
            {item.descricao && (
                <Text style={styles.descricao} numberOfLines={2}>
                    {item.descricao}
                </Text>
            )}
            <Text style={styles.data}>Criado em: {formatarData(item.criadoEm)}</Text>

            <View style={styles.buttons}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('ClippingForm', { clippingId: item._id })}
                >
                    <Text style={styles.buttonText}>Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: '#e74c3c' }]}
                    onPress={() => confirmarExclusao(item._id)}
                >
                    <Text style={styles.buttonText}>Excluir</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3498db" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={clippings}
                keyExtractor={item => item._id}
                renderItem={renderItem}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>Nenhum clipping encontrado</Text>
                }
                contentContainerStyle={styles.listContent}
                refreshing={refreshing}
                onRefresh={carregarClippings}
            />

            <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('ClippingForm')}
            >
                <Text style={styles.addButtonText}>Adicionar Clipping</Text>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    listContent: {
        paddingBottom: 20
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2
    },
    inactiveCard: {
        opacity: 0.7,
        backgroundColor: '#f0f0f0'
    },
    titulo: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#2c3e50'
    },
    periodo: {
        fontSize: 14,
        color: '#3498db',
        marginBottom: 4,
        fontWeight: '500'
    },
    descricao: {
        fontSize: 14,
        color: '#555',
        marginBottom: 8
    },
    data: {
        fontSize: 12,
        color: '#888',
        marginBottom: 8,
        fontStyle: 'italic'
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 8
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
        fontWeight: 'bold'
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
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#888'
    }
});