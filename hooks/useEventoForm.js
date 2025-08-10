
/*

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import useImagePicker from './useImagePicker';
import { fetchEvento, saveEvento, uploadEventoWithImage } from '../services/eventoService';
import { fetchAutores } from '../services/autorService';
import showAlert from '../utils/alertUtils';
import { formatarData } from '../utils/dateUtils';

const useEventoForm = () => {
    // Estado consolidado
    const [state, setState] = useState({
        evento: {
            nome: '',
            imagem: '',
            imagemBinaria: null,
            tipoEvento: '',
            dataInicial: '',
            dataFinal: '',
            endereco: '',
            estado: '',
            listaAutores: []
        },
        autores: [],
        autoresSelecionados: []
    });

    // Hooks de navegação e imagem
    const navigation = useNavigation();
    const route = useRoute();
    const { id } = route.params || {};

    const {
        image: imagemBinaria,
        imagePreview: imagemBinariaPreview,
        selectImage: selecionarImagem,
        removeImage: removerImagemBinaria
    } = useImagePicker(200); // 200KB max size

    // Carrega dados iniciais
    useEffect(() => {
        const loadData = async () => {
            try {
                if (id) {
                    const data = await fetchEvento(id);
                    const autoresSelecionados = Array.isArray(data.listaAutores)
                        ? data.listaAutores.map(autor => typeof autor === 'object' ? autor._id : autor)
                        : [];

                    setState(prev => ({
                        ...prev,
                        evento: {
                            nome: data.nome || '',
                            imagem: data.imagem || '',
                            imagemBinaria: data.imagemBinaria ? { uri: data.imagemBinaria } : null,
                            tipoEvento: data.tipoEvento || '',
                            dataInicial: data.dataInicial || '',
                            dataFinal: data.dataFinal || '',
                            endereco: data.endereco || '',
                            estado: data.estado || '',
                            listaAutores: Array.isArray(data.listaAutores) ? data.listaAutores : []
                        },
                        autoresSelecionados
                    }));
                }

                const response = await fetchAutores();
                setState(prev => ({ ...prev, autores: response.data }));
            } catch (error) {
                showAlert('Erro', id ? 'Não foi possível carregar os dados do evento' : 'Não foi possível carregar a lista de autores');
                console.error('Erro ao carregar dados:', error);
            }
        };

        loadData();
    }, [id]);

    // Manipulador genérico para campos do formulário - memoizado
    const handleChange = useCallback((name, value) => {
        setState(prev => ({
            ...prev,
            evento: {
                ...prev.evento,
                [name]: value
            }
        }));
    }, []);

    // Alterna seleção de autores - memoizado
    const toggleAutor = useCallback((autorId) => {
        const idToUse = typeof autorId === 'object' ? autorId._id : autorId;
        setState(prev => ({
            ...prev,
            autoresSelecionados: prev.autoresSelecionados.includes(idToUse)
                ? prev.autoresSelecionados.filter(id => id !== idToUse)
                : [...prev.autoresSelecionados, idToUse]
        }));
    }, []);

    // Seleciona imagem via dispositivo - memoizado
    const handleSelectImage = useCallback(async () => {
        const imagem = await selecionarImagem();
        if (imagem) {
            setState(prev => ({
                ...prev,
                evento: {
                    ...prev.evento,
                    imagemBinaria: imagem
                }
            }));
        }
    }, [selecionarImagem]);

    // Remove imagem selecionada - memoizado
    const handleRemoveImage = useCallback(() => {
        removerImagemBinaria();
        setState(prev => ({
            ...prev,
            evento: {
                ...prev.evento,
                imagemBinaria: null,
                imagem: '' // Limpa também a URL se existir
            }
        }));
    }, [removerImagemBinaria]);

    // Validação do formulário - não precisa de memoização
    const validarFormulario = useCallback(() => {
        if (!state.evento.nome?.trim()) {
            showAlert('Atenção', 'Por favor, informe o nome do evento');
            return false;
        }

        if (state.evento.dataInicial && state.evento.dataFinal && state.evento.dataFinal < state.evento.dataInicial) {
            showAlert('Atenção', 'A data final não pode ser anterior à data inicial');
            return false;
        }

        return true;
    }, [state.evento]);

    // Submissão do formulário - memoizado
    const salvarEvento = useCallback(async () => {
        if (!validarFormulario()) return;

        try {
            if (state.evento.imagemBinaria) {
                const formData = new FormData();
                formData.append('nome', state.evento.nome);
                formData.append('imagem', state.evento.imagem || '');
                formData.append('tipoEvento', state.evento.tipoEvento);
                formData.append('dataInicial', state.evento.dataInicial);
                formData.append('dataFinal', state.evento.dataFinal);
                formData.append('endereco', state.evento.endereco);
                formData.append('estado', state.evento.estado);

                state.autoresSelecionados.forEach((autorId, index) => {
                    formData.append(`listaAutores[${index}]`, autorId);
                });

                if (Platform.OS === 'web') {
                    const response = await fetch(state.evento.imagemBinaria.uri);
                    const blob = await response.blob();
                    formData.append('imagemBinaria', blob, 'evento-image.jpg');
                } else {
                    formData.append('imagemBinaria', {
                        uri: state.evento.imagemBinaria.uri,
                        name: 'evento-image.jpg',
                        type: 'image/jpeg'
                    });
                }

                await uploadEventoWithImage(formData, id);
            } else {
                await saveEvento({
                    ...state.evento,
                    listaAutores: state.autoresSelecionados
                }, id);
            }

            showAlert('Sucesso', id ? 'Evento atualizado com sucesso!' : 'Evento criado com sucesso!');
            navigation.navigate('Eventos');
        } catch (error) {
            console.error('Erro ao salvar evento:', error);
            showAlert('Erro', error.message || 'Ocorreu um erro ao salvar o evento');
        }
    }, [state, id, navigation, validarFormulario]);

    // Valores derivados para preview
    const imagemPreview = useMemo(() => {
        return state.evento.imagemBinaria?.uri || state.evento.imagem || null;
    }, [state.evento.imagemBinaria, state.evento.imagem]);

    // Retorno memoizado
    return useMemo(() => ({
        evento: state.evento,
        autores: state.autores,
        autoresSelecionados: state.autoresSelecionados,
        imagemPreview,
        handleChange,
        toggleAutor,
        selecionarImagem: handleSelectImage,
        removerImagemBinaria: handleRemoveImage,
        salvarEvento,
        formatarData
    }), [
        state.evento,
        state.autores,
        state.autoresSelecionados,
        imagemPreview,
        handleChange,
        toggleAutor,
        handleSelectImage,
        handleRemoveImage,
        salvarEvento
    ]);
};

export default useEventoForm;

*/




import React, { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import useImagePicker from './useImagePicker';
import { fetchEvento, saveEvento, uploadEventoWithImage } from '../services/eventoService';
import { fetchAutores } from '../services/autorService';
import showAlert from '../utils/alertUtils';
import { formatarData } from '../utils/dateUtils';

const useEventoForm = () => {
    
    // Estados do formulário
    const [evento, setEvento] = useState({
        nome: '',
        imagem: '',
        imagemBinaria: null,
        tipoEvento: '',
        dataInicial: '',
        dataFinal: '',
        endereco: '',
        estado: '',
        listaAutores: []
    });

    const [autores, setAutores] = useState([]);
    const [autoresSelecionados, setAutoresSelecionados] = useState([]);
    const [imagemPreview, setImagemPreview] = useState(null);

    // Hooks de navegação e imagem
    const navigation = useNavigation();
    const route = useRoute();
    const { id } = route.params || {};

    const {
        image: imagemBinaria,
        imagePreview: imagemBinariaPreview,
        selectImage: selecionarImagem,
        removeImage: removerImagemBinaria,
        setImage: setImagemBinaria,
        setImagePreview: setImagemBinariaPreview
    } = useImagePicker(200); // 200KB max size

    // Carrega dados iniciais
    useEffect(() => {
        if (id) carregarEvento(id);
        carregarAutores();
    }, [id]);

    // Função para carregar um evento existente
    const carregarEvento = async (id) => {
        try {
            const data = await fetchEvento(id);

            const eventoAtualizado = {
                nome: data.nome || '',
                imagem: data.imagem || '',
                imagemBinaria: data.imagemBinaria ? { uri: data.imagemBinaria } : null,
                tipoEvento: data.tipoEvento || '',
                dataInicial: data.dataInicial ? data.dataInicial.split('T')[0] : '',
                dataFinal: data.dataFinal ? data.dataFinal.split('T')[0] : '',
                endereco: data.endereco || '',
                estado: data.estado || '',
                listaAutores: Array.isArray(data.listaAutores) ? data.listaAutores : []
            };

            setEvento(eventoAtualizado);

            // Configura autores selecionados
            const autoresSelecionados = Array.isArray(data.listaAutores)
                ? data.listaAutores.map(autor => typeof autor === 'object' ? autor._id : autor)
                : [];

            setAutoresSelecionados(autoresSelecionados);
            
            // Configura preview de imagem
            if (data.imagemBinaria) {
                setImagemBinariaPreview(data.imagemBinaria);
            } else if (data.imagem) {

                console.log("link da imagem", data.imagem);
                setImagemPreview(data.imagem);
            }
        } catch (error) {
            showAlert('Erro', 'Não foi possível carregar os dados do evento');
            console.error('Erro ao carregar evento:', error);
        }
    };

    // Carrega a lista de autores
    const carregarAutores = async () => {
        try {
            const response = await fetchAutores();
            setAutores(response.data);
        } catch (error) {
            showAlert('Erro', 'Não foi possível carregar a lista de autores');
            console.error('Erro ao carregar autores:', error);
        }
    };

    // Manipulador genérico para campos do formulário
    const handleChange = (name, value) => {
        setEvento(prev => ({ ...prev, [name]: value }));

        // Atualiza preview quando a imagem por URL muda
        if (name === 'imagem') {
            setImagemPreview(value || null);
        }
    };

    // Alterna seleção de autores
    const toggleAutor = (autorId) => {
        const idToUse = typeof autorId === 'object' ? autorId._id : autorId;
        setAutoresSelecionados(prev =>
            prev.includes(idToUse)
                ? prev.filter(id => id !== idToUse)
                : [...prev, idToUse]
        );
    };

    // Seleciona imagem via dispositivo
    const handleSelectImage = async () => {
        const imagem = await selecionarImagem();
        if (imagem) {
            setEvento(prev => ({ ...prev, imagemBinaria: imagem }));
        }
    };

    // Remove imagem selecionada
    const handleRemoveImage = () => {
        removerImagemBinaria();
        setEvento(prev => ({ ...prev, imagemBinaria: null }));
    };

    // Validação do formulário
    const validarFormulario = () => {
        if (!evento.nome?.trim()) {
            showAlert('Atenção', 'Por favor, informe o nome do evento');
            return false;
        }

        if (evento.dataInicial && evento.dataFinal && evento.dataFinal < evento.dataInicial) {
            showAlert('Atenção', 'A data final não pode ser anterior à data inicial');
            return false;
        }

        return true;
    };

    // Submissão do formulário
    const salvarEvento = async () => {
        if (!validarFormulario()) return;

        try {
            if (evento.imagemBinaria) {
                // Cria FormData para envio com imagem
                const formData = new FormData();
                formData.append('nome', evento.nome);
                formData.append('imagem', evento.imagem || '');
                formData.append('tipoEvento', evento.tipoEvento);
                formData.append('dataInicial', evento.dataInicial);
                formData.append('dataFinal', evento.dataFinal);
                formData.append('endereco', evento.endereco);
                formData.append('estado', evento.estado);

                autoresSelecionados.forEach((autorId, index) => {
                    formData.append(`listaAutores[${index}]`, autorId);
                });

                // Adiciona a imagem ao FormData
                if (Platform.OS === 'web') {
                    const response = await fetch(evento.imagemBinaria.uri);
                    const blob = await response.blob();
                    formData.append('imagemBinaria', blob, 'evento-image.jpg');
                } else {
                    formData.append('imagemBinaria', {
                        uri: evento.imagemBinaria.uri,
                        name: 'evento-image.jpg',
                        type: 'image/jpeg'
                    });
                }

                await uploadEventoWithImage(formData, id);
            } else {
                // Envio sem imagem (JSON normal)
                await saveEvento({
                    ...evento,
                    listaAutores: autoresSelecionados
                }, id);
            }

            showAlert('Sucesso', id ? 'Evento atualizado com sucesso!' : 'Evento criado com sucesso!');
            navigation.navigate('Eventos');
        } catch (error) {
            console.error('Erro ao salvar evento:', error);
            showAlert('Erro', error.message || 'Ocorreu um erro ao salvar o evento');
        }
    };

    // Expõe apenas o necessário para o componente
    //return {
    //    evento,
    //    autores,
    //    autoresSelecionados,
    //    imagemPreview: imagemBinariaPreview || imagemPreview,
    //    handleChange,
    //    toggleAutor,
    //    selecionarImagem: handleSelectImage,
    //    removerImagemBinaria: handleRemoveImage,
    //    salvarEvento,
    //    formatarData
    //};

    return React.useMemo(() => ({
        evento,
        autores,
        autoresSelecionados,
        imagemPreview: imagemBinariaPreview || imagemPreview,
        handleChange,
        toggleAutor,
        selecionarImagem: handleSelectImage,
        removerImagemBinaria: handleRemoveImage,
        salvarEvento,
        formatarData
    }), [evento, autores, autoresSelecionados, imagemBinariaPreview, imagemPreview]);
    
};

export default useEventoForm;

