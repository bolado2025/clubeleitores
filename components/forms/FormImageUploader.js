import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import FormInput from './FormInput';
import ImagePreview from '../ui/ImagePreview';


const FormImageUploader = ({
    label,
    imageUrl,
    onImageUrlChange,
    onSelectImage,
    onRemoveImage,
    previewImage,
    maxSizeKB
}) => {
    console.log('[DEBUG] FormImageUploader - props recebidas:', {
        label,
        imageUrl,
        previewImage,
        maxSizeKB
    });

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>

            <FormInput
                label="Imagem (URL)"
                value={imageUrl}
                onChangeText={onImageUrlChange}
                placeholder="https://exemplo.com/imagem.jpg"
                keyboardType="url"
            />

            <Text style={styles.label}>Ou selecione uma imagem do dispositivo (max. {maxSizeKB}KB)</Text>
            <TouchableOpacity style={styles.uploadButton} onPress={onSelectImage}>
                <Text style={styles.uploadButtonText}>Selecionar Imagem</Text>
            </TouchableOpacity>

            <ImagePreview
                imageUri={previewImage}  // ← Mude para imageUri
                onRemove={onRemoveImage} // ← Também ajuste onRemoveImage para onRemove
            />
        </View>
    );
};

const styles = StyleSheet.create({
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
    }
});

//export default FormImageUploader;
export default React.memo(FormImageUploader);