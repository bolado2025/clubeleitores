import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform, Image as RNImage } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';


export default function UserForm() {
    const [user, setUser] = useState({
        nome: '',
        email: '',
        nickname: '',
        status: true,
        autoresFavoritos: [],
        eventosFavoritos: []
    });

    const [autores, setAutores] = useState([]);
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState(null);

    const navigation = useNavigation();
    const route = useRoute();
    const { userId } = route.params || {};

    useEffect(() => {
        if (userId) {
            carregarUsuario();
        }
        carregarAutores();
        carregarEventos();
    }, [userId]);

   
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

    const ProfileImageDisplay = ({ imageData }) => {
        if (!imageData?.data) {
            return (
                <View style={styles.userImagePlaceholder}>
                    <Text style={styles.placeholderText}>Foto</Text>
                </View>
            );
        }

        const uri = `data:${imageData.contentType};base64,${imageData.data}`;

        return (
            <CustomImage
                source={{ uri }}
                style={styles.userImage}
            />
        );
    };

   
    const carregarUsuario = () => {
        setLoading(true);
        fetch(`https://hubleitoresapi.onrender.com/api/v1/users/${userId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Dados recebidos:', data);

                setUser(data);

                /*
                // Verifica se a imagem existe e é uma string base64
                if (data.profileImage?.data && typeof data.profileImage.data === 'string') {
                    const mimeType = data.profileImage.contentType || 'image/jpeg';
                    const base64Uri = `data:${mimeType};base64,${data.profileImage.data}`;

                    setImage(base64Uri);

                    // Atualiza o user também com imagem estruturada corretamente
                    setUser(prev => ({
                        ...prev,
                        profileImage: {
                            data: data.profileImage.data,
                            contentType: mimeType
                        }
                    }));
                }*/

                if (data.profileImage?.data) {
                    let base64Image;

                    // Caso seja string (raro nesse seu backend, mas válido)
                    if (typeof data.profileImage.data === 'string') {
                        base64Image = data.profileImage.data;
                    }

                    // Caso seja objeto tipo Buffer (Node.js)
                    else if (
                        data.profileImage.data?.type === 'Buffer' &&
                        Array.isArray(data.profileImage.data.data)
                    ) {
                        const byteArray = new Uint8Array(data.profileImage.data.data);
                        let binaryString = '';
                        for (let i = 0; i < byteArray.length; i++) {
                            binaryString += String.fromCharCode(byteArray[i]);
                        }
                        base64Image = btoa(binaryString); // Converte binário para base64
                    }

                    if (base64Image) {
                        const mimeType = data.profileImage.contentType || 'image/jpeg';
                        const base64Uri = `data:${mimeType};base64,${base64Image}`;
                        setImage(base64Uri);

                        // Atualiza o user também
                        setUser(prev => ({
                            ...prev,
                            profileImage: {
                                data: base64Image,
                                contentType: mimeType
                            }
                        }));
                    }
                }
                    

                setLoading(false);
            })
            .catch(error => {
                console.error('Erro ao carregar usuário:', {
                    message: error.message,
                    stack: error.stack,
                    userId: userId
                });
                setLoading(false);
            });
    };
    

    const carregarAutores = () => {
        fetch('https://hubleitoresapi.onrender.com/api/v1/autores')
            .then(response => response.json())
            .then(response => setAutores(response.data))
            .catch(error => console.error('Erro ao buscar autores:', error));
    };

    const carregarEventos = () => {
        fetch('https://hubleitoresapi.onrender.com/api/v1/eventos')
            .then(response => response.json())
            .then(response => setEventos(response.data))
            .catch(error => console.error('Erro ao buscar eventos:', error));
    };

    const handleChange = (name, value) => {
        setUser(prev => ({ ...prev, [name]: value }));
    };

    const toggleAutor = (autorId) => {
        setUser(prev => {
            const novosAutores = prev.autoresFavoritos.includes(autorId)
                ? prev.autoresFavoritos.filter(id => id !== autorId)
                : [...prev.autoresFavoritos, autorId];
            return { ...prev, autoresFavoritos: novosAutores };
        });
    };

    const toggleEvento = (eventoId) => {
        setUser(prev => {
            const novosEventos = prev.eventosFavoritos.includes(eventoId)
                ? prev.eventosFavoritos.filter(id => id !== eventoId)
                : [...prev.eventosFavoritos, eventoId];
            return { ...prev, eventosFavoritos: novosEventos };
        });
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
            // Extrai o nome do arquivo de forma segura
            let fileName = 'profile.jpg';
            try {
                const uri = result.uri || result.assets?.[0]?.uri;
                if (uri) {
                    // Método seguro para extrair o nome do arquivo
                    const uriParts = uri.split('/');
                    fileName = uriParts[uriParts.length - 1] || fileName;
                }
            } catch (e) {
                console.warn('Erro ao extrair nome do arquivo:', e);
            }

            setImage(result.uri || result.assets?.[0]?.uri);
            setUser(prev => ({
                ...prev,
                profileImage: {
                    data: result.base64 || result.assets?.[0]?.base64,
                    contentType: result.type || result.assets?.[0]?.type || 'image/jpeg',
                    fileName: fileName
                }
            }));
        }
    };

    const salvarUsuario = () => {
        if (!user.nome || !user.email) {
            Alert.alert('Atenção', 'Nome e e-mail são obrigatórios');
            return;
        }

        const url = userId
            ? `https://hubleitoresapi.onrender.com/api/v1/users/${userId}`
            : 'https://hubleitoresapi.onrender.com/api/v1/users';
            
        
        const method = userId ? 'PUT' : 'POST';

        fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(user)
        })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => { throw new Error(text) });
                }
                return response.json();
            })
            .then(() => {
                Alert.alert('Sucesso', userId ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!');
                navigation.goBack();
            })
            .catch(error => {
                console.error('Erro:', error);
                Alert.alert('Erro', 'Ocorreu um erro ao salvar o usuário.');
            });
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
                value={user.nome}
                onChangeText={(text) => handleChange('nome', text)}
                placeholder="Nome completo"
            />

            <Text style={styles.label}>E-mail*</Text>
            <TextInput
                style={styles.input}
                value={user.email}
                onChangeText={(text) => handleChange('email', text)}
                placeholder="E-mail"
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <Text style={styles.label}>Nickname</Text>
            <TextInput
                style={styles.input}
                value={user.nickname}
                onChangeText={(text) => handleChange('nickname', text)}
                placeholder="Apelido (opcional)"
                autoCapitalize="none"
            />

            <Text style={styles.label}>Imagem de Perfil</Text>
          
            <View style={styles.imageContainer}>
                <TouchableOpacity
                    style={styles.imageButton}
                    onPress={selecionarImagem}
                >
                    <Text style={styles.imageButtonText}>
                        {image || user.profileImage?.data ? 'Alterar Imagem' : 'Selecionar Imagem'}
                    </Text>
                </TouchableOpacity>

                {/* Exibe a imagem nova ou a salva */}
                {image ? (
                    <Image source={{ uri: image }} style={styles.profileImage} />
                ) : (
                    <ProfileImageDisplay imageData={user.profileImage} />
                )}
            </View>

            <Text style={styles.label}>Status</Text>
            <Picker
                selectedValue={user.status}
                onValueChange={(value) => handleChange('status', value)}
                style={styles.input}
            >
                <Picker.Item label="Ativo" value={true} />
                <Picker.Item label="Inativo" value={false} />
            </Picker>

            <Text style={styles.sectionTitle}>Autores Favoritos</Text>
            <View style={styles.selectionContainer}>
                {autores.map(autor => (
                    <TouchableOpacity
                        key={autor._id}
                        style={[
                            styles.selectionItem,
                            user.autoresFavoritos.includes(autor._id) && styles.selectedItem
                        ]}
                        onPress={() => toggleAutor(autor._id)}
                    >
                        <Text>{autor.nome}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.sectionTitle}>Eventos Favoritos</Text>
            <View style={styles.selectionContainer}>
                {eventos.map(evento => (
                    <TouchableOpacity
                        key={evento._id}
                        style={[
                            styles.selectionItem,
                            user.eventosFavoritos.includes(evento._id) && styles.selectedItem
                        ]}
                        onPress={() => toggleEvento(evento._id)}
                    >
                        <Text>{evento.nome || evento.tipoEvento}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity
                style={styles.saveButton}
                onPress={salvarUsuario}
            >
                <Text style={styles.saveButtonText}>
                    {userId ? 'Atualizar Usuário' : 'Salvar Usuário'}
                </Text>
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
    imageButton: {
        backgroundColor: '#3498db',
        padding: 12,
        borderRadius: 4,
        alignItems: 'center',
        marginBottom: 16
    },
    imageButtonText: {
        color: 'white',
        fontWeight: 'bold'
    },
    imagePreview: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignSelf: 'center',
        marginBottom: 16
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
        color: '#2c3e50'
    },
    selectionContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 16
    },
    selectionItem: {
        padding: 8,
        margin: 4,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        backgroundColor: '#f5f5f5'
    },
    selectedItem: {
        backgroundColor: '#d4e6f1',
        borderColor: '#3498db'
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
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignSelf: 'center',
        marginVertical: 10
    },
    imageContainer: {
        alignItems: 'center',
        marginVertical: 15
    }
});