import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';

export default function AutorDetails() {
    const [autor, setAutor] = useState(null);
    const route = useRoute();
    const { id } = route.params;

    useEffect(() => {
        fetch(`https://hubleitoresapi.onrender.com/api/v1/autores/${id}`)
            .then(res => res.json())
            .then(data => setAutor(data))
            .catch(err => console.error(err));
    }, [id]);

    if (!autor) return <Text style={styles.loading}>Carregando...</Text>;

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Image source={{ uri: autor.image }} style={styles.image} />

            <Text style={styles.name}>{autor.nome}</Text>

            <View style={styles.section}>
                <Text style={styles.title}>Biografia:</Text>
                <Text style={styles.text}>{autor.bio || 'Não disponível.'}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.title}>Descrição:</Text>
                <Text style={styles.text}>{autor.description || 'Não disponível.'}</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#fff',
    },
    image: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignSelf: 'center',
        marginBottom: 16,
    },
    name: {
        fontSize: 26,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    section: {
        marginBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    text: {
        fontSize: 16,
        color: '#333',
    },
    loading: {
        flex: 1,
        textAlign: 'center',
        marginTop: 50,
        fontSize: 18,
    },
});

/*
import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';

export default function AutorDetails() {
    const [autor, setAutor] = useState(null);
    const route = useRoute();
    const { id } = route.params;

    useEffect(() => {
        fetch(`https://hubleitoresapi.onrender.com/api/v1/autores/${id}`)
            .then(res => res.json())
            .then(data => setAutor(data))
            .catch(err => console.error(err));
    }, [id]);

    if (!autor) return <Text>Carregando...</Text>;

    return (
        <View style={styles.container}>
            <Image source={{ uri: autor.image }} style={styles.image} />
            <Text style={styles.name}>{autor.nome}</Text>
            <Text>{autor.bio}</Text>
            <Text>{autor.description}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16 },
    image: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
    name: { fontSize: 24, fontWeight: 'bold' }
});
*/