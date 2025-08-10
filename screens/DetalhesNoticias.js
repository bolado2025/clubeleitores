import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DetalhesNoticia = ({ route }) => {
    const { titulo, descricao } = route.params;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{titulo}</Text>
            <Text style={styles.description}>{descricao}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        color: '#333',
    },
});

export default DetalhesNoticia;
