// src/components/ui/CustomButton.js
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, Platform } from 'react-native';

const CustomButton = ({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    icon,
    style,
    textStyle
}) => {
    // Define os estilos base com base nas props
    const getButtonStyles = () => {
        let baseStyle = {
            paddingHorizontal: 16,
            borderRadius: 4,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            ...Platform.select({
                web: {
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    userSelect: 'none'
                }
            })
        };

        // Tamanhos
        if (size === 'small') {
            baseStyle.paddingVertical = 8;
            baseStyle.height = 36;
        } else if (size === 'large') {
            baseStyle.paddingVertical = 14;
            baseStyle.height = 52;
        } else {
            // medium (default)
            baseStyle.paddingVertical = 12;
            baseStyle.height = 48;
        }

        // Variantes
        if (variant === 'secondary') {
            baseStyle.backgroundColor = '#f0f0f0';
            baseStyle.borderWidth = 1;
            baseStyle.borderColor = '#ddd';
        } else if (variant === 'danger') {
            baseStyle.backgroundColor = '#ff4444';
        } else if (variant === 'text') {
            baseStyle.backgroundColor = 'transparent';
        } else {
            // primary (default)
            baseStyle.backgroundColor = '#3498db';
        }

        // Estado disabled
        if (disabled) {
            baseStyle.opacity = 0.6;
            baseStyle.backgroundColor = variant === 'text' ? 'transparent' : '#e0e0e0';
        }

        return [styles.button, baseStyle, style];
    };

    const getTextStyles = () => {
        let baseStyle = {
            fontSize: 16,
            fontWeight: 'bold',
        };

        if (size === 'small') {
            baseStyle.fontSize = 14;
        } else if (size === 'large') {
            baseStyle.fontSize = 18;
        }

        if (variant === 'secondary') {
            baseStyle.color = '#333';
        } else if (variant === 'danger') {
            baseStyle.color = 'white';
        } else if (variant === 'text') {
            baseStyle.color = '#3498db';
        } else {
            // primary (default)
            baseStyle.color = 'white';
        }

        return [styles.text, baseStyle, textStyle];
    };

    return (
        <TouchableOpacity
            style={getButtonStyles()}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'primary' || variant === 'danger' ? 'white' : '#3498db'}
                    style={styles.loading}
                />
            ) : (
                <>
                    {icon && <View style={styles.iconContainer}>{icon}</View>}
                    <Text style={getTextStyles()}>{title}</Text>
                </>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        // Estilos base são definidos dinamicamente
    },
    text: {
        // Estilos base são definidos dinamicamente
    },
    loading: {
        marginRight: 8,
    },
    iconContainer: {
        marginRight: 8,
    },
});

//export default CustomButton;
export default React.memo(CustomButton);