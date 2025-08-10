import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Picker, Image, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import showAlert from '../utils/alertUtils';

const estadosBrasil = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const tiposEvento = [
    'Feira Literária', 'Lançamento de Livro', 'Palestra',
    'Workshop', 'Seminário', 'Outro'
];

const API_URL = process.env.EXPO_PUBLIC_AMBIENTE === 'dev' ? process.env.EXPO_PUBLIC_API_URL_DEV : process.env.EXPO_PUBLIC_API_URL_PROD;

const MAX_IMAGE_SIZE_KB = 200;

export default function EventoForm() {
    const [evento, setEvento] = useState({
        nome: '', // Novo campo obrigatório
        imagem: '', // Novo campo opcional
        imagemBinaria: null, // Novo estado para imagem binária
        tipoEvento: '',
        dataInicial: '',
        dataFinal: '',
        endereco: '',
        estado: '',
        listaAutores: []
    });

    const [autores, setAutores] = useState([]);
    const [autoresSelecionados, setAutoresSelecionados] = useState([]);
    const navigation = useNavigation();
    const route = useRoute();
    const { id } = route.params || {};

    const [imagemPreview, setImagemPreview] = useState(null);
    const [imagemBinariaPreview, setImagemBinariaPreview] = useState(null);

    useEffect(() => {

        if (id) {
            carregarEvento(id);
        }
        carregarAutores();

    }, [id]);

   
    const validateImageSize = async (uri) => {
        try {
            let fileSize;

            if (Platform.OS === 'web') {
                const response = await fetch(uri);
                const blob = await response.blob();
                fileSize = blob.size;
            } else {
                const fileInfo = await FileSystem.getInfoAsync(uri);
                fileSize = fileInfo.size;
            }

            return fileSize <= MAX_IMAGE_SIZE_KB * 1024;
        } catch (error) {
            console.error('Erro ao validar tamanho da imagem:', error);
            return false;
        }
    };

    const selecionarImagem = async () => {
    try {
        // Solicita permissão para acessar a galeria (mobile)
        if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                showAlert('Permissão necessária', 'Precisamos acessar sua galeria para selecionar a imagem.');
                return;
            }
        }

        // Abre o seletor de imagens
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
            base64: true, // Importante para a versão web
        });

        if (!result.canceled) {
            const uri = result.assets[0].uri;

            // Verifica o tamanho da imagem (solução universal)
            let fileSize;
            if (Platform.OS === 'web') {
                // Versão web: usa FileReader
                const response = await fetch(uri);
                const blob = await response.blob();
                fileSize = blob.size;
            } else {
                // Versão mobile: usa expo-file-system (se necessário)
                const fileInfo = await FileSystem.getInfoAsync(uri);
                fileSize = fileInfo.size;
            }

            // Valida o tamanho
            const isValidSize = await validateImageSize(uri);
            if (!isValidSize) {
                showAlert('Erro', `A imagem deve ter no máximo ${MAX_IMAGE_SIZE_KB}KB`);
                return;
            }            

            // Atualiza o estado com a imagem selecionada
            setImagemBinariaPreview(uri);
            setEvento(prev => ({
                ...prev,
                imagemBinaria: {
                    uri,
                    name: uri.split('/').pop(),
                    type: result.assets[0].type || 'image/jpeg',
                    base64: result.assets[0].base64, // Usa base64 na web
                }
            }));
        }
    } catch (error) {
        console.error('Erro ao selecionar imagem:', error);
        showAlert('Erro', 'Não foi possível selecionar a imagem');
    }
    };

    const removerImagemBinaria = () => {
        setImagemBinariaPreview(null);
        setEvento(prev => ({ ...prev, imagemBinaria: null }));
    };    

    const fetchWithErrorHandling = async (url, options = {}) => {
    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                errorData.message || `Erro HTTP: ${response.status}`
            );
        }

        return await response.json();
    } catch (error) {
        console.error('Erro na requisição:', error);
        throw error;
    }
    };
   
    const carregarEvento = (id) => {
        console.log(`[DEBUG] Iniciando carregamento do evento ID: ${id}`);

        fetch(`${API_URL}/eventos/${id}`)
            .then(response => {
                console.log('[DEBUG] Resposta da API recebida', {
                    status: response.status,
                    ok: response.ok,
                    headers: Array.from(response.headers.entries())
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('[DEBUG] Dados completos do evento recebidos:', {
                    dadosRecebidos: data,
                    listaAutoresRecebida: data.listaAutores,
                    tipoDadosAutores: typeof data.listaAutores,
                    quantidadeAutores: Array.isArray(data.listaAutores) ? data.listaAutores.length : 'não é array'
                });

                const eventoAtualizado = {
                    nome: data.nome || '',
                    imagem: data.imagem || '',
                    imagemBinaria: data.imagemBinaria ? { uri: `${API_URL}/eventos/${id}/imagem` } : null,
                    tipoEvento: data.tipoEvento || '',
                    dataInicial: data.dataInicial || '',
                    dataFinal: data.dataFinal || '',
                    endereco: data.endereco || '',
                    estado: data.estado || '',
                    listaAutores: Array.isArray(data.listaAutores) ? data.listaAutores : []
                };

                console.log('[DEBUG] Estado do evento que será definido:', {
                    eventoPreparado: eventoAtualizado,
                    listaAutoresPreparada: eventoAtualizado.listaAutores
                });

                setEvento(eventoAtualizado);

                const autoresSelecionados = Array.isArray(data.listaAutores)
                    ? data.listaAutores.map(autor => {
                        if (typeof autor === 'object' && autor._id) {
                            return autor._id;
                        }
                        return autor;
                    })
                    : [];

                console.log('[DEBUG] Autores selecionados que serão definidos:', autoresSelecionados);
                setAutoresSelecionados(autoresSelecionados);

                // Configura os previews de imagem
                if (data.imagemBinaria) {
                    console.log('[DEBUG] Evento tem imagem binária, configurando preview');
                    setImagemBinariaPreview(`${API_URL}/eventos/${id}/imagem?t=${Date.now()}`);
                } else if (data.imagem) {
                    console.log('[DEBUG] Evento tem imagem por URL, configurando preview:', data.imagem);
                    setImagemPreview(data.imagem);
                } else {
                    console.log('[DEBUG] Evento não tem imagem associada');
                }
            })
            .catch(error => {
                console.error('[ERROR] Falha ao carregar evento:', {
                    message: error.message,
                    stack: error.stack,
                    errorObject: error
                });
                showAlert('Erro', 'Não foi possível carregar os dados do evento');
            });
    };

    const carregarAutores = async () => {
        try {
            const response = await fetchWithErrorHandling(`${API_URL}/autores`);
            setAutores(response.data);
        } catch (error) {
            console.error('Erro ao buscar autores:', error);
            showAlert('Erro', 'Não foi possível carregar a lista de autores');
        }
    };

    const handleChange = (name, value) => {
        setEvento(prev => ({ ...prev, [name]: value }));
    };  

    const toggleAutor = (autorId) => {
        const idToUse = typeof autorId === 'object' ? autorId._id : autorId;
        setAutoresSelecionados(prev =>
            prev.includes(idToUse)
                ? prev.filter(id => id !== idToUse)
                : [...prev, idToUse]
        );
    };
   
    const salvarEvento = async () => {
        try {
            // Validação básica
            if (!evento.nome?.trim()) {
                showAlert('Atenção', 'Por favor, informe o nome do evento');
                return;
            }

            // URL base da API usando API_URL
            const url = id
                ? `${API_URL}/eventos/${id}`
                : `${API_URL}/eventos`;

            const method = id ? 'PUT' : 'POST';

            // CASO 1: SEM IMAGEM BINÁRIA (envia como JSON normal)
            if (!evento.imagemBinaria) {
                console.log('Enviando como JSON puro');
                const response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        nome: evento.nome,
                        imagem: evento.imagem || null,
                        tipoEvento: evento.tipoEvento,
                        dataInicial: evento.dataInicial,
                        dataFinal: evento.dataFinal,
                        endereco: evento.endereco,
                        estado: evento.estado,
                        listaAutores: autoresSelecionados || [] // Usando autoresSelecionados diretamente
                    }),
                });

                const result = await handleResponse(response);
                if (result.success) {
                    showAlert('Sucesso', id ? 'Evento atualizado com sucesso!' : 'Evento criado com sucesso!');
                    navigation.navigate('Eventos');
                }
                return;
            }

            // CASO 2: COM IMAGEM BINÁRIA (usa FormData)
            console.log('Preparando FormData com imagem');
            const formData = new FormData();

            // Adiciona campos básicos
            formData.append('nome', evento.nome);
            formData.append('imagem', evento.imagem || '');
            formData.append('tipoEvento', evento.tipoEvento);
            formData.append('dataInicial', evento.dataInicial);
            formData.append('dataFinal', evento.dataFinal);
            formData.append('endereco', evento.endereco);
            formData.append('estado', evento.estado);

            // Adiciona autores selecionados
            autoresSelecionados.forEach((autorId, index) => {
                const idToSend = typeof autorId === 'object' ? autorId._id : autorId;
                formData.append(`listaAutores[${index}]`, idToSend);
            });

            // Prepara o arquivo de imagem
            const imageUri = evento.imagemBinaria.uri;

            // Plataforma específica (web/mobile)
            if (Platform.OS === 'web') {
                const response = await fetch(imageUri);
                const blob = await response.blob();
                formData.append('imagemBinaria', blob, 'evento-image.jpg');
            } else {
                formData.append('imagemBinaria', {
                    uri: imageUri,
                    name: 'evento-image.jpg',
                    type: 'image/jpeg'
                });
            }

            console.log('Enviando FormData...');
            const response = await fetch(url, {
                method,
                body: formData,
            });

            const result = await handleResponse(response);
            if (result.success) {
                showAlert('Sucesso', id ? 'Evento atualizado com sucesso!' : 'Evento criado com sucesso!');
                navigation.navigate('Eventos');
            }

        } catch (error) {
            console.error('Erro ao salvar evento:', {
                message: error.message,
                stack: error.stack,
                errorObject: error
            });
            showAlert(
                'Erro',
                error.message || 'Ocorreu um erro ao salvar o evento'
            );
        }
    };

    // Função auxiliar para tratar a resposta
    const handleResponse = async (response) => {
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Erro na resposta:', { status: response.status, errorText });
            throw new Error(errorText || `Erro HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log('Resposta do servidor:', data);
        showAlert('Sucesso', id ? 'Evento atualizado!' : 'Evento criado!');
        return { success: true, data };
    };

    return (
        <ScrollView style={styles.container}>
            {/* Novo campo: Nome do Evento (obrigatório) */}
            <Text style={styles.label}>Nome do Evento*</Text>
            <TextInput
                style={styles.input}
                value={evento.nome}
                onChangeText={(text) => handleChange('nome', text)}
                placeholder="Ex: Feira Literária Internacional"
                maxLength={100}
            />

            {/* Novo campo: Imagem (URL opcional) */}
            <Text style={styles.label}>Imagem (URL)</Text>
            <TextInput
                style={styles.input}
                value={evento.imagem}
                onChangeText={(text) => {
                    handleChange('imagem', text);
                    // Atualiza o preview quando o texto muda
                    if (text) {
                        setImagemPreview(text);
                    } else {
                        setImagemPreview(null);
                    }
                }}
                placeholder="https://exemplo.com/imagem.jpg"
                keyboardType="url"
            />

            {/* Novo campo para upload de imagem */}
            <Text style={styles.label}>Ou selecione uma imagem do dispositivo</Text>
            <TouchableOpacity style={styles.uploadButton} onPress={selecionarImagem}>
                <Text style={styles.uploadButtonText}>Selecionar Imagem</Text>
            </TouchableOpacity>

            {/* Lógica de exibição de pré-visualização consolidada */}
            {id && evento.imagemBinaria ? (
                // Caso 1: Edição de evento com imagem binária existente
                <View style={styles.imagePreviewContainer}>
                    <Text style={styles.previewLabel}>Imagem atual do evento:</Text>
                    <Image
                        source={{ uri: `${API_URL}/eventos/${id}/imagem?t=${Date.now()}` }}
                        style={styles.imagePreview}
                        resizeMode="contain"
                        onError={(e) => {
                            console.log('Erro ao carregar imagem binária:', e.nativeEvent.error);
                            showAlert('Aviso', 'Não foi possível carregar a imagem do evento');
                        }}
                    />
                    <TouchableOpacity onPress={removerImagemBinaria}>
                        <Text style={styles.removeImageText}>Remover Imagem</Text>
                    </TouchableOpacity>
                </View>
            ) : id && evento.imagem ? (
                // Caso 2: Edição de evento com imagem por URL existente
                <View style={styles.imagePreviewContainer}>
                    <Text style={styles.previewLabel}>Imagem atual do evento (URL):</Text>
                    <Image
                        source={{ uri: evento.imagem }}
                        style={styles.imagePreview}
                        resizeMode="contain"
                        onError={(e) => console.log('Erro ao carregar imagem por URL:', e.nativeEvent.error)}
                    />
                </View>
            ) : imagemBinariaPreview ? (
                // Caso 3: Nova imagem binária selecionada (criação ou edição)
                <View style={styles.imagePreviewContainer}>
                    <Text style={styles.previewLabel}>Pré-visualização da imagem selecionada:</Text>
                    <Image
                        source={{ uri: imagemBinariaPreview }}
                        style={styles.imagePreview}
                        resizeMode="contain"
                    />
                    <TouchableOpacity onPress={removerImagemBinaria}>
                        <Text style={styles.removeImageText}>Remover Imagem</Text>
                    </TouchableOpacity>
                </View>
            ) : imagemPreview ? (
                // Caso 4: Nova imagem por URL digitada (criação ou edição)
                <View style={styles.imagePreviewContainer}>
                    <Text style={styles.previewLabel}>Pré-visualização da imagem por URL:</Text>
                    <Image
                        source={{ uri: imagemPreview }}
                        style={styles.imagePreview}
                        resizeMode="contain"
                        onError={(e) => {
                            console.log('Erro ao carregar pré-visualização por URL:', e.nativeEvent.error);
                            setImagemPreview(null);
                        }}
                    />
                </View>
            ) : null}

            <Text style={styles.label}>Tipo de Evento</Text>
            <Picker
                selectedValue={evento.tipoEvento}
                onValueChange={(value) => handleChange('tipoEvento', value)}
                style={styles.input}
            >
                <Picker.Item label="Selecione o tipo de evento" value="" />
                {tiposEvento.map(tipo => (
                    <Picker.Item key={tipo} label={tipo} value={tipo} />
                ))}
            </Picker>

            <Text style={styles.label}>Data Inicial</Text>
            <TextInput
                style={styles.input}
                value={evento.dataInicial}
                onChangeText={(text) => handleChange('dataInicial', text)}
                placeholder="YYYY-MM-DD"
            />

            <Text style={styles.label}>Data Final (opcional)</Text>
            <TextInput
                style={styles.input}
                value={evento.dataFinal}
                onChangeText={(text) => handleChange('dataFinal', text)}
                placeholder="YYYY-MM-DD"
            />

            <Text style={styles.label}>Endereço</Text>
            <TextInput
                style={styles.input}
                value={evento.endereco}
                onChangeText={(text) => handleChange('endereco', text)}
                placeholder="Endereço completo"
            />

            <Text style={styles.label}>Estado</Text>
            <Picker
                selectedValue={evento.estado}
                onValueChange={(value) => handleChange('estado', value)}
                style={styles.input}
            >
                <Picker.Item label="Selecione o estado" value="" />
                {estadosBrasil.map(estado => (
                    <Picker.Item key={estado} label={estado} value={estado} />
                ))}
            </Picker>

            <Text style={styles.label}>Autores Participantes</Text>
            <View style={styles.autoresContainer}>
                {autores.map(autor => (
                    <TouchableOpacity
                        key={autor._id}
                        style={[
                            styles.autorItem,
                            autoresSelecionados.includes(autor._id) && styles.autorSelecionado
                        ]}
                        onPress={() => toggleAutor(autor._id)}
                    >
                        <Text>{autor.nome}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={salvarEvento}>
                <Text style={styles.saveButtonText}>Salvar Evento</Text>
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
    label: {
        fontSize: 16,
        marginBottom: 8,
        fontWeight: 'bold',
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
    autoresContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 16
    },
    autorItem: {
        padding: 8,
        margin: 4,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        backgroundColor: '#f5f5f5'
    },
    autorSelecionado: {
        backgroundColor: '#d4e6f1',
        borderColor: '#3498db'
    },
    saveButton: {
        backgroundColor: '#3498db',
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
    imagePreviewContainer: {
        marginBottom: 16,
        alignItems: 'center'
    },
    previewLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8
    },
    imagePreview: {
        width: '100%',
        height: 150,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#ddd'
    },
    // Estilos existentes...
    uploadButton: {
        backgroundColor: '#3498db',
        padding: 12,
        borderRadius: 4,
        alignItems: 'center',
        marginBottom: 16
    },
    uploadButtonText: {
        color: 'white',
        fontWeight: 'bold'
    },
    removeImageText: {
        color: 'red',
        textAlign: 'center',
        marginTop: 8
    }
});