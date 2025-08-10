// AutorPublishings.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function AutorPublishings() {
    const [obras, setObras] = useState([]);
    const navigation = useNavigation();
    const route = useRoute();
    const { idAutor } = route.params;


    const carregarObras = () => {
        fetch(`https://hubleitoresapi.onrender.com/api/v1/obrasautores/autor/${idAutor}`)
            .then(response => response.json())
            .then(data => setObras(data.data))
            .catch(error => console.error('Erro ao buscar obras:', error));
    };

    useEffect(() => {
        carregarObras();
    }, []);

    const confirmarExclusao = (idObra) => {
        if (Platform.OS === 'web') {
            const confirmado = window.confirm('Deseja excluir esta obra?');
            if (confirmado) excluirObra(idObra);
        } else {
            Alert.alert(
                'Confirmar Exclusão',
                'Deseja excluir esta obra?',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                        text: 'Excluir',
                        onPress: () => excluirObra(idObra),
                        style: 'destructive',
                    },
                ]
            );
        }
    };

    const excluirObra = (idObra) => {
        fetch(`https://hubleitoresapi.onrender.com/api/v1/obrasautores/${idObra}`, {
            method: 'DELETE'
        })
            .then(res => {
                if (res.ok) {
                    Alert.alert('Sucesso', 'Obra excluída com sucesso!');
                    carregarObras();
                } else {
                    res.text().then(texto => {
                        console.error('Erro na resposta:', texto);
                        Alert.alert('Erro', 'Não foi possível excluir a obra.');
                    });
                }
            })
            .catch(err => {
                console.error('Erro de rede:', err);
                Alert.alert('Erro', 'Erro ao excluir obra.');
            });
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <TouchableOpacity onPress={() => navigation.navigate('ObraDetalhes', { obra: item })}>
             <Image source={{ uri: item.imagemLivro }} style={styles.image} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.nome}</Text>
                <View style={styles.buttons}>
                    <TouchableOpacity onPress={() => navigation.navigate('ObraDetalhes', { obra: item })}>
                        <Text style={styles.link}>Detalhes</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={obras}
                keyExtractor={item => item._id}
                renderItem={renderItem}
                ListEmptyComponent={<Text>Nenhuma obra encontrada.</Text>}
            />
        </View>
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
    image: { width: 60, height: 60, borderRadius: 8, marginRight: 12 },
    name: { fontSize: 18, fontWeight: 'bold' },
    buttons: { flexDirection: 'row', gap: 10, marginTop: 8 },
    link: { marginRight: 12, color: 'blue' },
    addButton: { marginTop: 16, backgroundColor: '#2ecc71', padding: 12, borderRadius: 8 },
    addText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
});
