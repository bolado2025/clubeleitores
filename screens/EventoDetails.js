import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { formatarData, calcularDiferencaDias } from '../utils/dateUtils';

export default function EventoDetails() {
    const [evento, setEvento] = useState(null);
    const [autores, setAutores] = useState([]);
    const navigation = useNavigation();
    const route = useRoute();
    const { id } = route.params;

    useEffect(() => {
        carregarEvento();
    }, [id]);

   /* const carregarEvento = () => {
        fetch(`https://hubleitoresapi.onrender.com/api/v1/eventos/${id}`)
            .then(response => response.json())
            .then(data => {
                setEvento(data);
                setAutores(data.listaAutores || []);
            })
            .catch(error => console.error('Erro ao carregar evento:', error));
    };*/

    const carregarEvento = () => {
    console.log(`Iniciando carregamento do evento ${id}`); // 1. Log inicial
    fetch(`https://hubleitoresapi.onrender.com/api/v1/eventos/${id}`)
        .then(response => {
            console.log('Status da resposta:', response.status); // 2. Log status
            return response.json();
        })
        .then(data => {
            console.log('Dados completos recebidos:', { // 3. Log completo
                ...data,
                hasImagemBinaria: !!data.imagemBinaria,
                hasImagemUrl: !!data.imagem
            });
            setEvento(data);
            setAutores(data.listaAutores || []);
        })
        .catch(error => console.error('Erro ao carregar evento:', error));
    };

    const editarEvento = () => {
        navigation.navigate('EventoForm', { id });
    };

    const verProgramacao = () => {
        navigation.navigate('Programacao', { idEvento: id });
    };

    if (!evento) {
        return (
            <View style={styles.container}>
                <Text>Carregando...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>

            <View style={styles.imageContainer}>
                {evento.imagemBinaria ? (
                    <Image
                        source={{
                            uri: `https://hubleitoresapi.onrender.com/api/v1/eventos/${evento._id}/imagem?t=${Date.now()}`,
                            cache: 'reload'
                        }}
                        style={styles.image}
                        resizeMode="contain"
                        onError={(e) => {
                            console.log('Falha na imagem binária:', {
                                error: e.nativeEvent.error,
                                uri: `https://hubleitoresapi.onrender.com/api/v1/eventos/${evento._id}/imagem`
                            });
                        }}
                    />
                ) : evento.imagem ? (
                    <Image
                        source={{
                            uri: evento.imagem,
                            cache: 'reload'
                        }}
                        style={styles.image}
                        resizeMode="contain"
                        onError={(e) => {
                            console.log('Falha na imagem por URL:', {
                                error: e.nativeEvent.error,
                                uri: evento.imagem
                            });
                        }}
                    />
                ) : (
                    <View style={[styles.image, styles.placeholderImage]}>
                        <Text>Sem imagem disponível</Text>
                    </View>
                )}

            </View>
             

            {evento.nome && (
                <Text style={styles.nomeEvento}>{evento.nome}</Text>
            )}

            <Text style={styles.titulo}>{evento.tipoEvento}</Text>

            <View style={styles.infoContainer}>
                <Text style={styles.label}>Estado:</Text>
                <Text style={styles.info}>{evento.estado}</Text>
            </View>

            <View style={styles.infoContainer}>
                <Text style={styles.label}>Data Inicial:</Text>
                <Text style={styles.info}>{formatarData(evento.dataInicial)}</Text>
            </View>

            {evento.dataFinal && (
                <View style={styles.infoContainer}>
                    <Text style={styles.label}>Data Final:</Text>
                    <Text style={styles.info}>{formatarData(evento.dataFinal)}</Text>
                </View>
            )}

            <View style={styles.infoContainer}>
                <Text style={styles.label2}>Faltam:</Text>
                <Text style={styles.info2}>{calcularDiferencaDias(formatarData(evento.dataInicial))} dias.</Text>
            </View>

            <View style={styles.infoContainer}>
                <Text style={styles.label}>Endereço:</Text>
                <Text style={styles.info}>{evento.endereco}</Text>
            </View>

            <Text style={styles.subtitulo}>Autores Participantes</Text>
            {autores.length > 0 ? (
                autores.map(autor => (
                    <TouchableOpacity
                        key={autor._id}
                        style={styles.autorCard}
                        onPress={() => navigation.navigate('AutorDetails', { id: autor._id })}
                    >
                        {autor.image && (
                            <Image source={{ uri: autor.image }} style={styles.autorImage} />
                        )}
                        <Text style={styles.autorNome}>{autor.nome}</Text>
                    </TouchableOpacity>
                ))
            ) : (
                <Text style={styles.semAutores}>Nenhum autor cadastrado para este evento</Text>
            )}

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={editarEvento}>
                    <Text style={styles.buttonText}>Editar Evento</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: '#2ecc71' }]}
                    onPress={verProgramacao}
                >
                    <Text style={styles.buttonText}>Ver Programação</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff'
    },
    eventoImagem: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        marginBottom: 16
    },
    nomeEvento: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#2c3e50',
        marginBottom: 8
    },
    titulo: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#3498db',
        textAlign: 'center'
    },
    subtitulo: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
        color: '#2c3e50'
    },
    infoContainer: {
        flexDirection: 'row',
        marginBottom: 10,
        alignItems: 'center'
    },
    label: {
        fontWeight: 'bold',
        marginRight: 5,
        color: '#555',
        width: 100
    },
    info: {
        flex: 1,
        color: '#333'
    },
    label2: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#222',             // Cor mais escura para maior contraste
        marginRight: 8,
        width: 120                // Um pouco mais de largura para melhor alinhamento        
    },
    info2: {
        flex: 1,
        fontSize: 16,
        color: '#000',             // Preto para contraste máximo
        fontWeight: '500',         // Meio termo entre normal e bold
        lineHeight: 22             // Melhor legibilidade
    },
    autorCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#f8f9fa',
        borderRadius: 5,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#e9ecef'
    },
    autorImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10
    },
    autorNome: {
        fontSize: 16
    },
    semAutores: {
        fontStyle: 'italic',
        color: '#6c757d',
        textAlign: 'center'
    },
    buttonContainer: {
        marginTop: 30,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    button: {
        backgroundColor: '#3498db',
        padding: 12,
        borderRadius: 5,
        flex: 1,
        marginHorizontal: 5,
        alignItems: 'center'
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold'
    },
    debugText: {
        fontSize: 10,
        color: 'red',
        textAlign: 'center',
        marginTop: 5
    },
    imageContainer: {
        height: 200,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#eee'
    },
    image: {
        width: '100%',
        height: '100%'
    }
});

/*
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function EventoDetails() {
    const [evento, setEvento] = useState(null);
    const [autores, setAutores] = useState([]);
    const navigation = useNavigation();
    const route = useRoute();
    const { id } = route.params;

    useEffect(() => {
        carregarEvento();
    }, [id]);

    const carregarEvento = () => {
        fetch(`https://hubleitoresapi.onrender.com/api/v1/eventos/${id}`)
            .then(response => response.json())
            .then(data => {
                setEvento(data);
                setAutores(data.listaAutores || []);
            })
            .catch(error => console.error('Erro ao carregar evento:', error));
    };

    const formatarData = (dataString) => {
        if (!dataString) return '';
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-BR');
    };

    const editarEvento = () => {
        navigation.navigate('EventoForm', { id });
    };

    const verProgramacao = () => {
        navigation.navigate('Programacao', { idEvento: id });
    };

    if (!evento) {
        return (
            <View style={styles.container}>
                <Text>Carregando...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.titulo}>{evento.tipoEvento}</Text>

            <View style={styles.infoContainer}>
                <Text style={styles.label}>Estado:</Text>
                <Text style={styles.info}>{evento.estado}</Text>
            </View>

            <View style={styles.infoContainer}>
                <Text style={styles.label}>Data Inicial:</Text>
                <Text style={styles.info}>{formatarData(evento.dataInicial)}</Text>
            </View>

            {evento.dataFinal && (
                <View style={styles.infoContainer}>
                    <Text style={styles.label}>Data Final:</Text>
                    <Text style={styles.info}>{formatarData(evento.dataFinal)}</Text>
                </View>
            )}

            <View style={styles.infoContainer}>
                <Text style={styles.label}>Endereço:</Text>
                <Text style={styles.info}>{evento.endereco}</Text>
            </View>

            <Text style={styles.subtitulo}>Autores Participantes</Text>
            {autores.length > 0 ? (
                autores.map(autor => (
                    <TouchableOpacity
                        key={autor._id}
                        style={styles.autorCard}
                        onPress={() => navigation.navigate('AutorDetails', { id: autor._id })}
                    >
                        {autor.image && (
                            <Image source={{ uri: autor.image }} style={styles.autorImage} />
                        )}
                        <Text style={styles.autorNome}>{autor.nome}</Text>
                    </TouchableOpacity>
                ))
            ) : (
                <Text style={styles.semAutores}>Nenhum autor cadastrado para este evento</Text>
            )}

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={editarEvento}>
                    <Text style={styles.buttonText}>Editar Evento</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: '#2ecc71' }]}
                    onPress={verProgramacao}
                >
                    <Text style={styles.buttonText}>Ver Programação</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff'
    },
    titulo: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#3498db',
        textAlign: 'center'
    },
    subtitulo: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
        color: '#2c3e50'
    },
    infoContainer: {
        flexDirection: 'row',
        marginBottom: 10,
        alignItems: 'center'
    },
    label: {
        fontWeight: 'bold',
        marginRight: 5,
        color: '#555',
        width: 100
    },
    info: {
        flex: 1,
        color: '#333'
    },
    autorCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#f8f9fa',
        borderRadius: 5,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#e9ecef'
    },
    autorImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10
    },
    autorNome: {
        fontSize: 16
    },
    semAutores: {
        fontStyle: 'italic',
        color: '#6c757d',
        textAlign: 'center'
    },
    buttonContainer: {
        marginTop: 30,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    button: {
        backgroundColor: '#3498db',
        padding: 12,
        borderRadius: 5,
        flex: 1,
        marginHorizontal: 5,
        alignItems: 'center'
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold'
    }
});
*/