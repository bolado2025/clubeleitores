import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    ScrollView,
    StyleSheet,
    Image,
    Platform
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

const CustomImage = ({ source, style }) => {
    if (Platform.OS === 'web') {
        return <img src={source.uri} style={style} alt="Autor" />;
    }
    return <Image source={source} style={style} />;
};

export default function AutorForm() {
    const [autor, setAutor] = useState({
        nome: '',
        bio: '',
        description: '',
        social: {
            tiktok: '',
            facebook: '',
            instagram: '',
            twitter: '',
            youtube: ''
        },
        image: '',
        status: true
    });

    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const navigation = useNavigation();
    const route = useRoute();
    const { autorId } = route.params || {};

    useEffect(() => {
        if (autorId) {
            carregarAutor();
        }
    }, [autorId]);

  /*  const carregarAutor = () => {
        setLoading(true);
        fetch(`https://hubleitoresapi.onrender.com/api/v1/autores/${autorId}`)
            .then(response => response.json())
            .then(data => {
                setAutor(data);

                // Configura a imagem para exibição
                if (data.image) {
                    setImage(data.image);
                } else if (data.imageData?.base64) {
                    const uri = `data:${data.imageData.contentType};base64,${data.imageData.base64}`;
                    setImage(uri);
                }
                setLoading(false);
            })
            .catch(error => {
                console.error('Erro ao carregar autor:', error);
                setLoading(false);
            });
    };
    */

    const carregarAutor = () => {
        setLoading(true);
        fetch(`https://hubleitoresapi.onrender.com/api/v1/autores/${autorId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao carregar autor');
                }
                return response.json();
            })
            .then(data => {
                console.log('Dados do autor recebidos:', {
                    hasImage: !!data.image,
                    hasImageData: !!data.imageData,
                    imageDataType: typeof data.imageData?.data
                });

                setAutor(data);

                // Prioriza imagem por link se existir
                if (data.image) {
                    console.log('Usando imagem por URL');
                    setImage(data.image);
                }
                // Processa imagem do banco de dados
                else if (data.imageData) {
                    console.log('Processando imagem do banco...');

                    let base64Data;
                    const imageData = data.imageData;

                    // Caso 1: Dados já em base64 (string)
                    if (typeof imageData.data === 'string') {
                        base64Data = imageData.data;
                    }
                    // Caso 2: Dados como Buffer (formato MongoDB)
                    else if (imageData.data?.type === 'Buffer' && Array.isArray(imageData.data.data)) {
                        console.log('Convertendo Buffer para base64...');
                        const bufferData = imageData.data.data;
                        const byteArray = new Uint8Array(bufferData);
                        let binaryString = '';
                        byteArray.forEach(byte => {
                            binaryString += String.fromCharCode(byte);
                        });
                        base64Data = btoa(binaryString);
                    }

                    if (base64Data) {
                        const mimeType = imageData.contentType || 'image/jpeg';
                        const imageUri = `data:${mimeType};base64,${base64Data}`;
                        console.log('URI da imagem gerada:', imageUri.substring(0, 50) + '...');
                        setImage(imageUri);
                    } else {
                        console.warn('Formato de imagem não reconhecido:', imageData);
                    }
                } else {
                    console.log('Nenhuma imagem disponível para este autor');
                    setImage(null);
                }

                setLoading(false);
            })
            .catch(error => {
                console.error('Erro ao carregar autor:', {
                    message: error.message,
                    error
                });
                setLoading(false);
            });
    };

    const handleChange = (name, value) => {
        setAutor(prev => ({ ...prev, [name]: value }));
    };

    const handleSocialChange = (network, value) => {
        setAutor(prev => ({
            ...prev,
            social: {
                ...prev.social,
                [network]: value
            }
        }));
    };

    const selecionarImagem = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria para selecionar uma imagem.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
            base64: true
        });

        if (!result.cancelled) {
            let fileName = 'autor.jpg';
            try {
                const uri = result.uri || result.assets?.[0]?.uri;
                if (uri) {
                    const uriParts = uri.split('/');
                    fileName = uriParts[uriParts.length - 1] || fileName;
                }
            } catch (e) {
                console.warn('Erro ao extrair nome do arquivo:', e);
            }

            setImage(result.uri || result.assets?.[0]?.uri);

            // Limpa o link externo quando uma imagem é selecionada
            setAutor(prev => ({
                ...prev,
                image: '',
                imageData: {
                    data: result.base64 || result.assets?.[0]?.base64,
                    contentType: result.type || result.assets?.[0]?.type || 'image/jpeg',
                    fileName: fileName
                }
            }));
        }
    };

    /*
    const salvarAutor = () => {
        if (!autor.nome) {
            Alert.alert('Atenção', 'Nome é obrigatório');
            return;
        }

        const url = autorId
            ? `https://hubleitoresapi.onrender.com/api/v1/autores/${autorId}`
            : 'https://hubleitoresapi.onrender.com/api/v1/autores';

        const method = autorId ? 'PUT' : 'POST';

        // Se tiver um link de imagem, limpa os dados de imagem
        const dadosParaEnviar = {
            ...autor,
            imageData: autor.image ? null : autor.imageData
        };

        fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dadosParaEnviar)
        })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => { throw new Error(text) });
                }
                return response.json();
            })
            .then(() => {
                Alert.alert('Sucesso', autorId ? 'Autor atualizado com sucesso!' : 'Autor criado com sucesso!');
                navigation.goBack();
            })
            .catch(error => {
                console.error('Erro:', error);
                Alert.alert('Erro', 'Ocorreu um erro ao salvar o autor.');
            });
    };*/

    const salvarAutor = async () => {
        try {
            console.log('Iniciando salvamento do autor...');

            if (!autor.nome) {
                Alert.alert('Atenção', 'Nome é obrigatório');
                return;
            }

            const url = autorId
                ? `https://hubleitoresapi.onrender.com/api/v1/autores/${autorId}`
                : 'https://hubleitoresapi.onrender.com/api/v1/autores';

            console.log('URL da requisição:', url);

            // Teste de conexão simples antes da requisição real
            try {
                const testConnection = await fetch(url, { method: 'OPTIONS' });
                console.log('Teste de conexão OPTIONS:', testConnection);
            } catch (testError) {
                console.error('Falha no teste de conexão:', testError);
            }

            const method = autorId ? 'PUT' : 'POST';
            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            };

            console.log('Headers da requisição:', headers);
            console.log('Dados a serem enviados:', {
                ...autor,
                imageData: autor.image ? null : autor.imageData
            });

            const response = await fetch(url, {
                method,
                headers,
                body: JSON.stringify({
                    ...autor,
                    imageData: autor.image ? null : autor.imageData
                })
            });

            console.log('Resposta recebida - Status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Resposta não OK:', errorText);
                throw new Error(errorText || 'Erro desconhecido');
            }

            const data = await response.json();
            console.log('Dados da resposta:', data);

            Alert.alert('Sucesso', autorId ? 'Autor atualizado com sucesso!' : 'Autor criado com sucesso!');
            navigation.goBack();
        } catch (error) {
            console.error('Erro detalhado:', {
                message: error.message,
                stack: error.stack,
                name: error.name,
                fullError: JSON.stringify(error)
            });

            Alert.alert(
                'Erro',
                `Não foi possível salvar o autor. ${error.message || ''}`
            );
        }
    };
   
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text>Carregando...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.label}>Nome*</Text>
            <TextInput
                style={styles.input}
                value={autor.nome}
                onChangeText={(text) => handleChange('nome', text)}
                placeholder="Nome do autor"
            />

            <Text style={styles.label}>Biografia</Text>
            <TextInput
                style={[styles.input, { height: 100 }]}
                value={autor.bio}
                onChangeText={(text) => handleChange('bio', text)}
                placeholder="Biografia do autor"
                multiline
            />

            <Text style={styles.label}>Descrição</Text>
            <TextInput
                style={[styles.input, { height: 100 }]}
                value={autor.description}
                onChangeText={(text) => handleChange('description', text)}
                placeholder="Descrição detalhada"
                multiline
            />

            <Text style={styles.label}>Imagem do Autor</Text>
            <View style={styles.imageContainer}>
                <View style={styles.imageOptions}>
                    <TextInput
                        style={[styles.input, { flex: 1 }]}
                        value={autor.image}
                        onChangeText={(text) => {
                            // Limpa a imagem selecionada quando um link é inserido
                            if (text) {
                                setImage(text);
                                setAutor(prev => ({
                                    ...prev,
                                    image: text,
                                    imageData: null
                                }));
                            } else {
                                setImage(null);
                            }
                        }}
                        placeholder="URL da imagem (opcional)"
                        keyboardType="url"
                    />

                    <Text style={styles.orText}>OU</Text>

                    <TouchableOpacity
                        style={styles.imageButton}
                        onPress={selecionarImagem}
                    >
                        <Text style={styles.imageButtonText}>
                            {image ? 'Alterar Imagem' : 'Selecionar Imagem'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Exibe a imagem (link ou upload) */}
                {image && (
                    <CustomImage
                        source={{ uri: image }}
                        style={styles.profileImage}
                    />
                )}
            </View>

            <Text style={styles.sectionTitle}>Redes Sociais</Text>

            <Text style={styles.label}>TikTok</Text>
            <TextInput
                style={styles.input}
                value={autor.social.tiktok}
                onChangeText={(text) => handleSocialChange('tiktok', text)}
                placeholder="@usuario"
            />

            <Text style={styles.label}>Facebook</Text>
            <TextInput
                style={styles.input}
                value={autor.social.facebook}
                onChangeText={(text) => handleSocialChange('facebook', text)}
                placeholder="URL do perfil"
                keyboardType="url"
            />

            <Text style={styles.label}>Instagram</Text>
            <TextInput
                style={styles.input}
                value={autor.social.instagram}
                onChangeText={(text) => handleSocialChange('instagram', text)}
                placeholder="@usuario"
            />

            <Text style={styles.label}>Twitter/X</Text>
            <TextInput
                style={styles.input}
                value={autor.social.twitter}
                onChangeText={(text) => handleSocialChange('twitter', text)}
                placeholder="@usuario"
            />

            <Text style={styles.label}>YouTube</Text>
            <TextInput
                style={styles.input}
                value={autor.social.youtube}
                onChangeText={(text) => handleSocialChange('youtube', text)}
                placeholder="URL do canal"
                keyboardType="url"
            />

            <Text style={styles.label}>Status</Text>
            <View style={styles.statusContainer}>
                <TouchableOpacity
                    style={[
                        styles.statusButton,
                        autor.status && styles.statusButtonActive
                    ]}
                    onPress={() => handleChange('status', true)}
                >
                    <Text style={[
                        styles.statusButtonText,
                        autor.status && styles.statusButtonTextActive
                    ]}>
                        Ativo
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.statusButton,
                        !autor.status && styles.statusButtonActive
                    ]}
                    onPress={() => handleChange('status', false)}
                >
                    <Text style={[
                        styles.statusButtonText,
                        !autor.status && styles.statusButtonTextActive
                    ]}>
                        Inativo
                    </Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={styles.saveButton}
                onPress={salvarAutor}
            >
                <Text style={styles.saveButtonText}>
                    {autorId ? 'Atualizar Autor' : 'Salvar Autor'}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        fontWeight: 'bold',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        padding: 10,
        marginBottom: 15,
        fontSize: 16,
    },
    imageContainer: {
        marginBottom: 20,
    },
    imageOptions: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    orText: {
        marginHorizontal: 10,
        color: '#666',
    },
    imageButton: {
        backgroundColor: '#3498db',
        padding: 10,
        borderRadius: 4,
    },
    imageButtonText: {
        color: '#fff',
    },
    profileImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
        alignSelf: 'center',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
        color: '#2c3e50',
    },
    statusContainer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    statusButton: {
        flex: 1,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        alignItems: 'center',
    },
    statusButtonActive: {
        backgroundColor: '#2ecc71',
        borderColor: '#2ecc71',
    },
    statusButtonText: {
        color: '#666',
    },
    statusButtonTextActive: {
        color: '#fff',
    },
    saveButton: {
        backgroundColor: '#2ecc71',
        padding: 15,
        borderRadius: 4,
        alignItems: 'center',
        marginTop: 20,
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

/*
import React, { useEffect, useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function AutorForm() {
    const [autor, setAutor] = useState({
        nome: '',
        bio: '',
        description: '',
        image: '',
        social: { instagram: '', twitter: '' }
    });

    const route = useRoute();
    const navigation = useNavigation();
    const { id } = route.params || {};

    useEffect(() => {
        if (id) {
            fetch(`https://hubleitoresapi.onrender.com/api/v1/autores/${id}`)
                .then(res => res.json())
                .then(data => setAutor(data))
                .catch(err => Alert.alert('Erro', 'Erro ao carregar autor'));
        }
    }, [id]);

    const salvar = () => {
        const method = id ? 'PUT' : 'POST';
        const url = id
            ? `https://hubleitoresapi.onrender.com/api/v1/autores/${id}`
            : 'https://hubleitoresapi.onrender.com/api/v1/autores';

        fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(autor)
        })
            .then(res => res.json())
            .then(() => {
                Alert.alert('Sucesso', `Autor ${id ? 'atualizado' : 'criado'} com sucesso`);
                navigation.navigate('AutorList');
            })
            .catch(err => Alert.alert('Erro', 'Erro ao salvar autor'));
    };

    return (
        <View style={styles.container}>
            <TextInput style={styles.input} placeholder="Nome" value={autor.nome} onChangeText={text => setAutor({ ...autor, nome: text })} />
            <TextInput style={styles.input} placeholder="Bio" value={autor.bio} onChangeText={text => setAutor({ ...autor, bio: text })} />
            <TextInput style={styles.input} placeholder="Descrição" value={autor.description} onChangeText={text => setAutor({ ...autor, description: text })} />
            <TextInput style={styles.input} placeholder="Imagem (URL)" value={autor.image} onChangeText={text => setAutor({ ...autor, image: text })} />
            <Button title={id ? 'Atualizar' : 'Criar'} onPress={salvar} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16 },
    input: {
        backgroundColor: '#fff',
        padding: 12,
        marginBottom: 10,
        borderRadius: 8,
        borderColor: '#ccc',
        borderWidth: 1
    }
});
*/