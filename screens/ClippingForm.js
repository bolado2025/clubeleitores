import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

export default function ClippingForm() {
    const [clipping, setClipping] = useState({
        titulo: '',
        descricao: '',
        periodo: '',
        status: true
    });

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const navigation = useNavigation();
    const route = useRoute();
    const { clippingId } = route.params || {};

    useEffect(() => {
        if (clippingId) {
            carregarClipping();
        }
    }, [clippingId]);

    const carregarClipping = () => {
        setLoading(true);
        fetch(`https://hubleitoresapi.onrender.com/api/v1/clippings/${clippingId}`)
            .then(response => response.json())
            .then(data => {
                setClipping(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Erro ao carregar clipping:', error);
                setLoading(false);
            });
    };

    const handleChange = (name, value) => {
        setClipping(prev => ({ ...prev, [name]: value }));
    };

    const salvarClipping = () => {
        if (!clipping.titulo) {
            Alert.alert('Atenção', 'O título é obrigatório');
            return;
        }

        setSaving(true);

        const url = clippingId
            ? `https://hubleitoresapi.onrender.com/api/v1/clippings/${clippingId}`
            : 'https://hubleitoresapi.onrender.com/api/v1/clippings';

        const method = clippingId ? 'PUT' : 'POST';

        fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(clipping)
        })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => { throw new Error(text) });
                }
                return response.json();
            })
            .then(() => {
                Alert.alert('Sucesso', clippingId ? 'Clipping atualizado com sucesso!' : 'Clipping criado com sucesso!');
                navigation.goBack();
            })
            .catch(error => {
                console.error('Erro:', error);
                Alert.alert('Erro', 'Ocorreu um erro ao salvar o clipping.');
            })
            .finally(() => {
                setSaving(false);
            });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3498db" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.label}>Título*</Text>
            <TextInput
                style={styles.input}
                value={clipping.titulo}
                onChangeText={(text) => handleChange('titulo', text)}
                placeholder="Título do clipping"
                maxLength={100}
            />

            <Text style={styles.label}>Período</Text>
            <TextInput
                style={styles.input}
                value={clipping.periodo}
                onChangeText={(text) => handleChange('periodo', text)}
                placeholder="Ex: Maio 2023"
            />

            <Text style={styles.label}>Descrição</Text>
            <TextInput
                style={[styles.input, { height: 100 }]}
                value={clipping.descricao}
                onChangeText={(text) => handleChange('descricao', text)}
                placeholder="Descrição detalhada"
                multiline
                numberOfLines={4}
            />

            <Text style={styles.label}>Status</Text>
            <Picker
                selectedValue={clipping.status}
                onValueChange={(value) => handleChange('status', value)}
                style={styles.input}
            >
                <Picker.Item label="Ativo" value={true} />
                <Picker.Item label="Inativo" value={false} />
            </Picker>

            <TouchableOpacity
                style={styles.saveButton}
                onPress={salvarClipping}
                disabled={saving}
            >
                {saving ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.saveButtonText}>
                        {clippingId ? 'Atualizar Clipping' : 'Salvar Clipping'}
                    </Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff'
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333'
    },
    input: {
        height: 50,
        borderColor: '#ddd',
        borderWidth: 1,
        marginBottom: 16,
        paddingHorizontal: 10,
        borderRadius: 4,
        backgroundColor: '#f9f9f9'
    },
    saveButton: {
        backgroundColor: '#2ecc71',
        padding: 15,
        borderRadius: 4,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 30
    },
    saveButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16
    }
});