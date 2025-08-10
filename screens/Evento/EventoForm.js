import React, {useRef, useEffect} from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import FormInput from '../../components/forms/FormInput';
import FormImageUploader from '../../components/forms/FormImageUploader';
import FormPicker from '../../components/forms/FormPicker';
import FormAutoresSelector from '../../components/forms/FormAutoresSelector';
import FormDateInput from '../../components/forms/FormDateInput';
import CustomButton from '../../components/ui/CustomButton';
import useEventoForm from '../../hooks/useEventoForm';
import { estadosBrasil, tiposEvento } from '../../utils/constants';

const EventoForm = () => {

    const renderCount = useRef(0);

    useEffect(() => {
        renderCount.current += 1;
        console.log(`EventoForm renderizado (vez ${renderCount.current})`);

        return () => {
            console.log('EventoForm desmontado');
        };
    }, []); // Agora só loga na montagem

    const {
        evento,
        autores,
        autoresSelecionados,
        imagemPreview,
        imagemBinariaPreview,
        handleChange,
        toggleAutor,
        selecionarImagem,
        removerImagemBinaria,
        salvarEvento,
        setImagemPreview
    } = useEventoForm();

    return (
        <ScrollView style={styles.container}>
            <FormInput
                label="Nome do Evento"
                value={evento.nome}
                onChangeText={(text) => handleChange('nome', text)}
                placeholder="Ex: Feira Literária Internacional"
                maxLength={100}
                required
            />

            <FormImageUploader
                label="Imagem do Evento"
                imageUrl={evento.imagem}
                onImageUrlChange={(text) => {
                    console.log('[DEBUG] onImageUrlChange - novo valor:', text);
                    handleChange('imagem', text);
                    if (text) {
                        console.log('[DEBUG] Definindo imagemPreview com URL:', text);
                        setImagemPreview(text);
                    } else {
                        console.log('[DEBUG] Removendo imagemPreview');
                        setImagemPreview(null);
                    }
                }}
                onSelectImage={() => {
                    console.log('[DEBUG] Iniciando seleção de imagem...');
                    selecionarImagem()
                        .then(() => console.log('[DEBUG] Imagem selecionada com sucesso'))
                        .catch(error => console.error('[DEBUG] Erro ao selecionar imagem:', error));
                }}
                onRemoveImage={() => {
                    console.log('[DEBUG] Removendo imagem binária');
                    removerImagemBinaria();
                }}
                previewImage={imagemBinariaPreview || imagemPreview}
                maxSizeKB={200}
            />

            <FormPicker
                label="Tipo de Evento"
                selectedValue={evento.tipoEvento}
                onValueChange={(value) => handleChange('tipoEvento', value)}
                items={tiposEvento}
            />


            <FormDateInput
                label="Data Inicial"
                value={evento.dataInicial}
                onChange={(formattedDate) => handleChange('dataInicial', formattedDate)}
                placeholder="Selecione a data inicial"
                required
                mode="date"
            />

            <FormDateInput
                label="Data Final (opcional)"
                value={evento.dataFinal}
                onChange={(formattedDate) => handleChange('dataFinal', formattedDate)}
                placeholder="Selecione a data final"
                mode="date"
                minimumDate={evento.dataInicial ? new Date(evento.dataInicial) : undefined} // Isso garante que a data final não seja anterior à inicial
            />

            <FormInput
                label="Endereço"
                value={evento.endereco}
                onChangeText={(text) => handleChange('endereco', text)}
                placeholder="Endereço completo"
            />

            <FormPicker
                label="Estado"
                selectedValue={evento.estado}
                onValueChange={(value) => handleChange('estado', value)}
                items={estadosBrasil}
            />

            <FormAutoresSelector
                label="Autores Participantes"
                autores={autores}
                autoresSelecionados={autoresSelecionados}
                onToggleAutor={toggleAutor}
            />

            <CustomButton
                title="Salvar Evento"
                onPress={salvarEvento}
                style={styles.saveButton}
            />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff'
    },
    saveButton: {
        marginTop: 20,
        marginBottom: 30
    }
});

export default React.memo(EventoForm);
