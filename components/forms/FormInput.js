import React from 'react';
import { Text, TextInput, View, StyleSheet } from 'react-native';

const FormInput = ({ label, value, onChangeText, placeholder, maxLength, keyboardType, required }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>
                {label}{required && '*'}
            </Text>
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                maxLength={maxLength}
                keyboardType={keyboardType}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
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
        paddingHorizontal: 10,
        borderRadius: 4,
        backgroundColor: '#f9f9f9'
    }
});

//export default FormInput;
export default React.memo(FormInput);