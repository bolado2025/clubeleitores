import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';

const ProgramacaoDetails = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { programacao } = route.params;
    const [autoresDetalhados, setAutoresDetalhados] = useState({});
    const [loading, setLoading] = useState(true);

    // Função para carregar os detalhes dos autores
    useEffect(() => {
        const fetchAutores = async () => {
            try {
                const autorIds = [];
                console.log('[DEBUG] Coletando IDs de autores únicos...');

                programacao.schedule.forEach(item => {
                    if (item.listaAutores && item.listaAutores.length > 0) {
                        item.listaAutores.forEach(autor => {
                            // Extrai o _id do objeto autor
                            const autorId = autor._id || autor.id;

                            if (autorId && !autorIds.includes(autorId)) {
                                console.log(`[DEBUG] Adicionando autor ID: ${autorId}`);
                                autorIds.push(autorId);
                            } else if (!autorId) {
                                console.warn('[WARN] Autor sem ID válido encontrado:', autor);
                            }
                        });
                    }
                });

                console.log('[DEBUG] Resultado final:', {
                    totalItensProcessados: programacao.schedule.length,
                    autoresUnicos: autorIds,
                    totalAutoresUnicos: autorIds.length
                });

                // Buscar detalhes de cada autor
                const autoresPromises = autorIds.map(async (autorId) => {
                    try {
                        const response = await axios.get(`https://hubleitoresapi.onrender.com/api/v1/autores/${autorId}`);
                        return { id: autorId, ...response.data };
                    } catch (error) {
                        console.error(`Erro ao buscar autor ${autorId}:`, error);
                        return { id: autorId, nome: 'Autor desconhecido', image: null };
                    }
                });

                const autores = await Promise.all(autoresPromises);

                // Converter array para objeto com ID como chave
                const autoresMap = {};
                autores.forEach(autor => {
                    autoresMap[autor.id] = autor;
                });

                setAutoresDetalhados(autoresMap);
                setLoading(false);
            } catch (error) {
                console.error('Erro ao carregar autores:', error);
                setLoading(false);
            }
        };

        fetchAutores();
    }, [programacao]);

    const handleAutorPress = (autorId) => {
        //const autor = autoresDetalhados[autorId];
        //if (autor) {
        //    navigation.navigate('AutorDetails', { autor });
        //}
        navigation.navigate('AutorDetails', { id: autorId });
        
    };

/*    const renderAutorItem = (autorId) => {
        const autor = autoresDetalhados[autorId] || { id: autorId, nome: 'Carregando...', image: null };

        return (
            <TouchableOpacity
                key={autor.id}
                style={styles.autorContainer}
                onPress={() => handleAutorPress(autor.id)}
            >
                {autor.image ? (
                    <Image
                        source={{ uri: autor.image }}
                        style={styles.autorFoto}
                    />
                ) : (
                    <View style={[styles.autorFoto, styles.placeholderFoto]}>
                        <Text style={styles.placeholderText}>{autor.nome.charAt(0)}</Text>
                    </View>
                )}
                <Text style={styles.autorNome}>{autor.nome}</Text>
            </TouchableOpacity>
        );
    };*/

    const renderAutorItem = (autor) => {
        // Garante que temos um objeto autor válido
        if (!autor || !autor._id) {
            console.warn('Autor inválido:', autor);
            return null;
        }

        return (
            <TouchableOpacity
                key={autor._id} // Usa apenas o _id como key
                style={styles.autorContainer}
                onPress={() => handleAutorPress(autor._id)}
            >
                {autor.image ? (
                    <Image
                        source={{ uri: autor.image }}
                        style={styles.autorFoto}
                    />
                ) : (
                    <View style={[styles.autorFoto, styles.placeholderFoto]}>
                        <Text style={styles.placeholderText}>{autor.nome?.charAt(0) || '?'}</Text>
                    </View>
                )}
                <Text style={styles.autorNome}>{autor.nome || 'Autor desconhecido'}</Text>
            </TouchableOpacity>
        );
    };


    const renderAtracao = ({ item, index }) => (
        <View style={styles.atracaoItem}>
            <Text style={styles.atracaoHorario}>
                {item.horaInicio} - {item.horaFim}
            </Text>
            <Text style={styles.atracaoTitulo}>{item.atracao}</Text>

            {item.descricaoProgramacao && (
                <Text style={styles.atracaoDescricao}>{item.descricaoProgramacao}</Text>
            )}

            {loading && item.listaAutores?.length > 0 && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#3498db" />
                </View>
            )}

            {!loading && item.listaAutores?.length > 0 && (
                <View style={styles.participantesSection}>
                    <Text style={styles.sectionTitle}>Autores:</Text>
                    <View style={styles.autoresContainer}>
                        {item.listaAutores?.map(autor => renderAutorItem(autoresDetalhados[autor._id] || autor))}
                    </View>
                </View>
            )}

            {item.listaUsuariosProg?.length > 0 && (
                <View style={styles.participantesSection}>
                    <Text style={styles.sectionTitle}>Participantes:</Text>
                    <View style={styles.usuariosContainer}>
                        {item.listaUsuariosProg.map((usuario) => (
                            <View key={usuario._id} style={styles.usuarioContainer}>
                                {usuario.foto ? (
                                    <Image
                                        source={{ uri: usuario.foto }}
                                        style={styles.usuarioFoto}
                                    />
                                ) : (
                                    <View style={[styles.usuarioFoto, styles.placeholderFoto]}>
                                        <Text style={styles.placeholderText}>{usuario.nome.charAt(0)}</Text>
                                    </View>
                                )}
                                <Text style={styles.usuarioNome}>{usuario.nome}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}
        </View>
    );

    if (loading && programacao.schedule.some(item => item.listaAutores?.length > 0)) {
        return (
            <View style={styles.loadingFullscreen}>
                <ActivityIndicator size="large" color="#3498db" />
                <Text style={styles.loadingText}>Carregando informações de Programação...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.titulo}>{programacao.nomeProgramacao}</Text>
                <Text style={styles.data}>{new Date(programacao.dia).toLocaleDateString('pt-BR')}</Text>
            </View>

            <FlatList
                data={programacao.schedule}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderAtracao}
                ListEmptyComponent={
                    <Text style={styles.semAtracoes}>Nenhuma atração cadastrada para este dia</Text>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5'
    },
    header: {
        marginBottom: 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd'
    },
    titulo: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2c3e50'
    },
    data: {
        fontSize: 16,
        color: '#7f8c8d',
        marginTop: 5
    },
    atracaoItem: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2
    },
    atracaoHorario: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#e74c3c',
        marginBottom: 5
    },
    atracaoTitulo: {
        fontSize: 18,
        fontWeight: '600',
        color: '#3498db',
        marginBottom: 8
    },
    atracaoDescricao: {
        fontSize: 14,
        color: '#333',
        marginBottom: 10,
        lineHeight: 20
    },
    participantesSection: {
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#555',
        marginBottom: 5
    },
    autoresContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 5
    },
    usuariosContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 5
    },
    autorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15,
        marginBottom: 8,
        padding: 5,
        borderRadius: 20,
        backgroundColor: '#f0f8ff'
    },
    usuarioContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 15,
        marginBottom: 8
    },
    autorFoto: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 5,
        backgroundColor: '#e0e0e0'
    },
    usuarioFoto: {
        width: 30,
        height: 30,
        borderRadius: 15,
        marginRight: 5,
        backgroundColor: '#e0e0e0'
    },
    placeholderFoto: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#bdc3c7'
    },
    placeholderText: {
        color: '#fff',
        fontWeight: 'bold'
    },
    autorNome: {
        fontSize: 12,
        color: '#2c3e50'
    },
    usuarioNome: {
        fontSize: 12,
        color: '#555'
    },
    semAtracoes: {
        textAlign: 'center',
        marginTop: 20,
        color: '#95a5a6',
        fontStyle: 'italic'
    },
    loadingContainer: {
        padding: 10,
        alignItems: 'center'
    },
    loadingFullscreen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loadingText: {
        marginTop: 10,
        color: '#7f8c8d'
    }
});

export default ProgramacaoDetails;

/*
import React from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList } from 'react-native';
import { useRoute } from '@react-navigation/native';

const ProgramacaoDetails = () => {
    const route = useRoute();
    const { programacao } = route.params;

    const renderAtracao = ({ item, index }) => (
        <View style={styles.atracaoItem}>
            <Text style={styles.atracaoHorario}>
                {item.horaInicio} - {item.horaFim}
            </Text>
            <Text style={styles.atracaoTitulo}>{item.atracao}</Text>
            {item.descricaoProgramacao && (
                <Text style={styles.atracaoDescricao}>{item.descricaoProgramacao}</Text>
            )}

            {item.listaAutores?.length > 0 && (
                <Text style={styles.participantes}>
                    Autores: {item.listaAutores.map(a => a.nome).join(', ')}
                </Text>
            )}

            {item.listaUsuariosProg?.length > 0 && (
                <Text style={styles.participantes}>
                    Participantes: {item.listaUsuariosProg.map(u => u.nome).join(', ')}
                </Text>
            )}
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.titulo}>{programacao.nomeProgramacao}</Text>
                <Text style={styles.data}>{new Date(programacao.dia).toLocaleDateString('pt-BR')}</Text>
            </View>

            <FlatList
                data={programacao.schedule}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderAtracao}
                ListEmptyComponent={
                    <Text style={styles.semAtracoes}>Nenhuma atração cadastrada para este dia</Text>
                }
            />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5'
    },
    header: {
        marginBottom: 20,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd'
    },
    titulo: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#2c3e50'
    },
    data: {
        fontSize: 16,
        color: '#7f8c8d',
        marginTop: 5
    },
    atracaoItem: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2
    },
    atracaoHorario: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#e74c3c',
        marginBottom: 5
    },
    atracaoTitulo: {
        fontSize: 18,
        fontWeight: '600',
        color: '#3498db',
        marginBottom: 8
    },
    atracaoDescricao: {
        fontSize: 14,
        color: '#333',
        marginBottom: 10,
        lineHeight: 20
    },
    participantes: {
        fontSize: 13,
        color: '#555',
        marginTop: 5,
        fontStyle: 'italic'
    },
    semAtracoes: {
        textAlign: 'center',
        marginTop: 20,
        color: '#95a5a6',
        fontStyle: 'italic'
    }
});

export default ProgramacaoDetails;

*/