import { useState } from 'react';
import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import showAlert from '../utils/alertUtils';

const useImagePicker = (maxSizeKB) => {
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

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
            return fileSize <= maxSizeKB * 1024;
        } catch (error) {
            console.error('Erro ao validar tamanho da imagem:', error);
            return false;
        }
    };

    const selectImage = async () => {
        try {

            console.log("Entrou no selectImage"); 

            if (Platform.OS !== 'web') {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                    showAlert('Permissão necessária', 'Precisamos acessar sua galeria para selecionar a imagem.');
                    return null;
                }
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
                base64: true,
            });

            if (!result.canceled) {
                const uri = result.assets[0].uri;
                const isValidSize = await validateImageSize(uri);

                if (!isValidSize) {
                    showAlert('Erro', `A imagem deve ter no máximo ${maxSizeKB}KB`);
                    return null;
                }

                //console.log("Entrou no Uri", uri);

                setImagePreview(uri);
                return {
                    uri,
                    name: uri.split('/').pop(),
                    type: result.assets[0].type || 'image/jpeg',
                    base64: result.assets[0].base64,
                };
            }
        } catch (error) {
            console.error('Erro ao selecionar imagem:', error);
            showAlert('Erro', 'Não foi possível selecionar a imagem');
        }
        return null;
    };

    const removeImage = () => {
        setImage(null);
        setImagePreview(null);
    };

    return {
        image,
        imagePreview,
        selectImage,
        removeImage,
        setImage,
        setImagePreview
    };
};

export default useImagePicker;