// ObraDetalhes.js
import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Linking } from 'react-native';
import { useRoute } from '@react-navigation/native';

export default function ObraDetalhes() {
    const route = useRoute();
    const { obra } = route.params;

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Image source={{ uri: obra.imagemLivro }} style={styles.image} />
            <Text style={styles.title}>{obra.nome}</Text>
            <Text style={styles.label}>Gênero:</Text>
            <Text>{obra.genero}</Text>
            <Text style={styles.label}>Descrição:</Text>
            <Text>{obra.descricao}</Text>
            <Text style={styles.label}>Link Afiliado:</Text>
            <Text style={styles.link} onPress={() => Linking.openURL(obra.linkAfiliado)}>
                {obra.linkAfiliado}
            </Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    image: {
        width: 120,
        height: 120,
        marginBottom: 16,
        borderRadius: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    label: {
        fontWeight: 'bold',
        marginTop: 10,
    },
    link: {
        color: 'blue',
        textDecorationLine: 'underline',
        marginTop: 4,
    },
});
