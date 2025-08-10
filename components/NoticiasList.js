import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';

const API_BASE_URL = process.env.EXPO_PUBLIC_AMBIENTE === 'dev'
? process.env.EXPO_PUBLIC_API_URL_DEV
: process.env.EXPO_PUBLIC_API_URL_PROD;

const NoticiasList = React.memo(({ navigation }) => {
    const [noticias, setNoticias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    
    /*
    const fetchNoticias = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetch(`${API_BASE_URL}/clippings?limit=10`); // Aumentei o limite para pegar mais registros
            
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            const data = await response.json();
            
            if (data && data.data) {
                setNoticias(data.data);
            } else {
                throw new Error('Formato de dados inesperado');
            }
        } catch (error) {
            console.error('Erro ao carregar notícias:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };
    */

    const fetchNoticias = async () => {
        try {
            console.log('[1] - Iniciando carregamento de notícias...');
            setLoading(true);
            setError(null);
            
            const apiUrl = `${API_BASE_URL}/clippings?limit=10`;
            console.log('[2] - URL da API:', apiUrl);
            
            console.log('[3] - Fazendo requisição para o backend...');
            const response = await fetch(apiUrl);
            console.log('[4] - Resposta recebida. Status:', response.status);
            
            if (!response.ok) {
                const errorResponse = await response.text();
                console.error('[5] - Erro na resposta:', {
                    status: response.status,
                    statusText: response.statusText,
                    url: apiUrl,
                    responseText: errorResponse
                });
                throw new Error(`Erro HTTP: ${response.status}`);
            }
    
            console.log('[6] - Processando JSON da resposta...');
            const data = await response.json();
            console.log('[7] - Dados recebidos:', {
                estrutura: Object.keys(data),
                contagemNoticias: data.data ? data.data.length : 0,
                exemploPrimeiraNoticia: data.data ? data.data[0] : null
            });
            
            if (data && data.data) {
                console.log('[8] - Atualizando estado com notícias recebidas');
                setNoticias(data.data);
            } else {
                console.warn('[9] - Formato de dados inesperado:', data);
                throw new Error('Formato de dados inesperado');
            }
        } catch (error) {
            console.error('[10] - Erro no bloco catch:', {
                mensagem: error.message,
                stack: error.stack,
                tipoErro: typeof error
            });
            setError(error.message);
        } finally {
            console.log('[11] - Finalizando carregamento');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNoticias();
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Erro ao carregar notícias</Text>
                <Text style={styles.errorDetails}>{error}</Text>
                <TouchableOpacity onPress={fetchNoticias} style={styles.retryButton}>
                    <Text style={styles.retryButtonText}>Tentar novamente</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View
            contentContainerStyle={styles.scrollContainer}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={false}
        >
            <View style={styles.container}>
                <Text style={styles.clipping}>Clipping de Notícias</Text>
                <View style={styles.noticiasContainer}>
                    {noticias.map((noticia) => (
                        <TouchableOpacity
                            key={noticia._id}
                            style={styles.noticiaItem}
                            onPress={() => navigation.navigate('DetalhesNoticias', { 
                                titulo: noticia.titulo, 
                                descricao: noticia.descricao,
                                periodo: noticia.periodo
                            })}
                        >
                            <View style={styles.noticiaContent}>
                                <Text style={styles.bullet}>•</Text>
                                <View style={styles.noticiaTextContainer}>
                                    <Text style={styles.clippingcontent}>{noticia.titulo}</Text>
                                    <Text style={styles.descricao}>{noticia.descricao}</Text>
                                    <Text style={styles.periodo}>{noticia.periodo}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 80,
    },
    container: {
        marginHorizontal: 16,
        marginTop: 12,
    },
    clipping: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    noticiasContainer: {
        backgroundColor: '#e0e0e0',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 5,
    },
    noticiaItem: {
        marginBottom: 16,
    },
    noticiaContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    bullet: {
        fontSize: 24,
        color: '#555',
        marginRight: 8,
    },
    noticiaTextContainer: {
        flex: 1,
    },
    clippingcontent: {
        fontSize: 18,
        fontWeight: 'bold',
        fontStyle: 'italic',
        marginBottom: 4,
    },
    descricao: {
        fontSize: 14,
        color: '#333',
        marginBottom: 4,
    },
    periodo: {
        fontSize: 12,
        color: '#555',
        fontStyle: 'italic',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        color: 'red',
        marginBottom: 10,
    },
    errorDetails: {
        fontSize: 14,
        color: '#555',
        marginBottom: 20,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#007AFF',
        padding: 10,
        borderRadius: 5,
    },
    retryButtonText: {
        color: 'white',
        fontSize: 16,
    },
});

export default NoticiasList;