// src/components/ui/ImagePreview.js
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';

const ImagePreview = ({
    imageUri,
    onRemove,
    previewLabel = "Pré-visualização:",
    removeText = "Remover Imagem",
    containerStyle,
    imageStyle,
    labelStyle,
    removeButtonStyle,
    removeTextStyle
}) => {

    console.log("imagem --->", imageUri)

    if (!imageUri) return null;

    return (
        <View style={[styles.container, containerStyle]}>
            {previewLabel && (
                <Text style={[styles.label, labelStyle]}>{previewLabel}</Text>
            )}

            <Image
                source={{ uri: imageUri }}
                style={[styles.image, imageStyle]}
                resizeMode="contain"
                onError={(e) => console.log('Erro ao carregar imagem:', e.nativeEvent.error)}
            />

            {onRemove && (
                <TouchableOpacity
                    onPress={onRemove}
                    style={[styles.removeButton, removeButtonStyle]}
                >
                    <Text style={[styles.removeText, removeTextStyle]}>{removeText}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        alignItems: 'center',
        width: '100%',
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        alignSelf: 'flex-start',
    },
    image: {
        width: '100%',
        height: 150,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#ddd',
        ...Platform.select({
            web: {
                maxWidth: '100%',
                objectFit: 'contain',
            },
        }),
    },
    removeButton: {
        marginTop: 8,
        padding: 4,
    },
    removeText: {
        color: 'red',
        textAlign: 'center',
        ...Platform.select({
            web: {
                cursor: 'pointer',
                ':hover': {
                    textDecoration: 'underline',
                },
            },
        }),
    },
});

//export default ImagePreview;
export default React.memo(ImagePreview);
