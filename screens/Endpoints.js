import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';

const links = [
    { label: '/api/v1/users', url: 'https://hubleitoresapi.onrender.com/api/v1/users' },
    { label: '/api/v1/autores', url: 'https://hubleitoresapi.onrender.com/api/v1/autores' },
    { label: '/api/v1/obrasautores', url: 'https://hubleitoresapi.onrender.com/api/v1/obrasautores' },
    { label: '/api/v1/eventos', url: 'https://hubleitoresapi.onrender.com/api/v1/eventos' },
    { label: '/api/v1/programacaoeventos', url: 'https://hubleitoresapi.onrender.com/api/v1/programacaoeventos' },
    { label: '/api/v1/clippings', url: 'https://hubleitoresapi.onrender.com/api/v1/clippings' },
    { label: '/api/v1/planos', url: 'https://hubleitoresapi.onrender.com/api/v1/planos' },
];


export default function Endpoints() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();
    const route = useRoute();
  
    const fetchApi = async (url) => {
        try {
            setLoading(true);
            const res = await axios.get(url);
            setData(res.data);
        } catch (err) {
            setData({ error: err.message });
        } finally {
            setLoading(false);
        }
    };

    const createOrUpdateUserInBackend = async (userData) => {
    try {
        console.group('[DEBUG] createOrUpdateUserInBackend');

        // 1. Log dos dados recebidos
        console.log('[DEBUG] Input userData:', {
            email: userData.email,
            name: userData.nome,
            hasToken: !!userData.accessToken,
            tokenStart: userData.accessToken?.substring(0, 6) + '...', // Mostra apenas início do token por segurança
            profileImage: !!userData.profileImage
        });

        // 2. Preparação da requisição
        const endpoint = 'https://hubleitoresapi.onrender.com/api/v1/users/auth/google';
        console.log('[DEBUG] Calling endpoint:', endpoint);

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Adicione outros headers se necessário
            },
            body: JSON.stringify(userData)
        };

        console.log('[DEBUG] Request options:', {
            ...requestOptions,
            body: JSON.parse(requestOptions.body) // Mostra o body formatado
        });

        // 3. Execução da requisição
        console.log('[DEBUG] Making request...');
        const response = await fetch(endpoint, requestOptions);

        // 4. Log da resposta bruta
        console.log('[DEBUG] Raw response:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            headers: Object.fromEntries(response.headers.entries())
        });

        // 5. Processamento da resposta
        if (!response.ok) {
            const errorResponse = await response.text();
            console.error('[ERROR] Backend response error:', {
                status: response.status,
                error: errorResponse
            });
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log('[DEBUG] Success response:', responseData);
        console.groupEnd();

        return responseData;

    } catch (error) {
        console.groupCollapsed('[ERROR] createOrUpdateUserInBackend failed');
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            requestData: userData
        });

        if (error.response) {
            try {
                const errorBody = await error.response.json();
                console.error('Error response body:', errorBody);
            } catch (e) {
                console.error('Could not parse error response:', e);
            }
        }

        console.groupEnd();
        throw error; // Re-lança o erro para ser tratado pelo chamador
    }
    };

    const renderData = (obj, level = 0) => {
        if (Array.isArray(obj)) {
            return obj.map((item, index) => (
                <View key={index} style={[styles.item, { marginLeft: level * 10 }]}>
                    <Text style={styles.itemHeader}>Registro {index + 1}</Text>
                    {renderData(item, level + 1)}
                </View>
            ));
        } else if (typeof obj === 'object' && obj !== null) {
            return Object.entries(obj).map(([key, value]) => (
                <View key={key} style={{ marginBottom: 4, marginLeft: level * 10 }}>
                    <Text style={styles.key}>{key}:</Text>
                    {typeof value === 'object' ? (
                        renderData(value, level + 1)
                    ) : (
                        <Text style={styles.value}>{String(value)}</Text>
                    )}
                </View>
            ));
        } else {
            return <Text style={styles.value}>{String(obj)}</Text>;
        }
    };


    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>
                Catálogo de Serviços do HubdeLeitores (Versão Beta - Sem validação de Token JWT)
            </Text>
            {links.map((link) => (
                <TouchableOpacity key={link.url} onPress={() => fetchApi(link.url)} style={styles.button}>
                    <Text style={styles.linkText}>{link.label}</Text>
                </TouchableOpacity>
            ))}
            <View style={styles.resultContainer}>
                {loading && <Text>Carregando...</Text>}
                {!loading && data && renderData(data)}
            </View>
        </ScrollView>
    );
}


const styles = StyleSheet.create({
    container: { padding: 20, marginTop: 40 },
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
    button: { padding: 10, backgroundColor: '#3498db', marginBottom: 10, borderRadius: 5 },
    linkText: { color: '#fff', fontSize: 16 },
    resultContainer: { marginTop: 20 },
    item: { padding: 8, borderBottomWidth: 1, borderColor: '#eee' },
    itemHeader: {
        fontWeight: 'bold',
        fontSize: 18,        // fonte maior
        color: 'red',        // cor vermelha
        marginBottom: 6,
        marginTop: 10,
    },
    key: { fontWeight: 'bold', color: '#2c3e50' },
    value: { marginLeft: 8, color: '#555' },
    text: { marginBottom: 4 },
});

