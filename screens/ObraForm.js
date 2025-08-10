// ObraForm.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

// Função de alerta compatível com web e mobile
const showAlert = (title, message) => {
    if (Platform.OS === 'web') {
        window.alert(`${title}\n\n${message}`);
    } else {
        Alert.alert(title, message);
    }
};

export default function ObraForm() {
    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [linkAfiliado, setLinkAfiliado] = useState('');
    const [imagemLivro, setImagemLivro] = useState('');
    const [genero, setGenero] = useState('');

    const navigation = useNavigation();
    const route = useRoute();
    const { idObra, idAutor } = route.params;

    useEffect(() => {
        if (idObra) {
            fetch(`https://hubleitoresapi.onrender.com/api/v1/obrasautores`)
                .then(res => res.json())
                .then(response => {
                    const obra = response.data.find(o => o._id === idObra);
                    if (obra) {
                        setNome(obra.nome);
                        setDescricao(obra.descricao);
                        setLinkAfiliado(obra.linkAfiliado);
                        setImagemLivro(obra.imagemLivro);
                        setGenero(obra.genero || '');
                    }
                })
                .catch(error => console.error('Erro ao carregar obra:', error));
        }
    }, [idObra]);

    const salvarObra = () => {
        if (!nome || !descricao || !linkAfiliado || !imagemLivro) {
            showAlert('Erro', 'Preencha todos os campos!');
            return;
        }

        const obra = { idAutor, nome, descricao, linkAfiliado, imagemLivro, genero };

        const url = idObra
            ? `https://hubleitoresapi.onrender.com/api/v1/obrasautores/${idObra}`
            : 'https://hubleitoresapi.onrender.com/api/v1/obrasautores';

        const method = idObra ? 'PUT' : 'POST';

        fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(obra)
        })
            .then(res => {
                if (res.ok) {
                    showAlert('Sucesso', `Obra ${idObra ? 'atualizada' : 'cadastrada'} com sucesso!`);
                    navigation.navigate('AutorList');
                    //navigation.goBack();
                } else {
                    res.text().then(texto => {
                        console.error('Erro:', texto);
                        showAlert('Erro', 'Não foi possível salvar a obra.');
                    });
                }
            })
            .catch(err => {
                console.error('Erro de rede:', err);
                showAlert('Erro', 'Erro de rede ao salvar obra.');
            });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Nome da Obra:</Text>
            <TextInput style={styles.input} value={nome} onChangeText={setNome} />

            <Text style={styles.label}>Descrição:</Text>
            <TextInput style={styles.input} value={descricao} onChangeText={setDescricao} multiline />

            <Text style={styles.label}>Gênero:</Text>
            <Picker
                selectedValue={genero}
                style={styles.input}
                onValueChange={(itemValue) => setGenero(itemValue)}
            >
                <Picker.Item label="Selecione um gênero..." value="" />
                <Picker.Item label="Drama" value="Drama" />
                <Picker.Item label="Ficção" value="Ficção" />
                <Picker.Item label="Romance" value="Romance" />
                <Picker.Item label="Aventura" value="Aventura" />
                <Picker.Item label="Terror" value="Terror" />
                <Picker.Item label="Fantasia" value="Fantasia" />
                <Picker.Item label="Biografia" value="Biografia" />
                <Picker.Item label="Poesia" value="Poesia" />
                <Picker.Item label="Outro" value="Outro" />
            </Picker>

            <Text style={styles.label}>Link Afiliado:</Text>
            <TextInput style={styles.input} value={linkAfiliado} onChangeText={setLinkAfiliado} />

            <Text style={styles.label}>URL da Imagem da Capa:</Text>
            <TextInput style={styles.input} value={imagemLivro} onChangeText={setImagemLivro} />

            <TouchableOpacity style={styles.button} onPress={salvarObra}>
                <Text style={styles.buttonText}>{idObra ? 'Atualizar' : 'Cadastrar'} Obra</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16 },
    label: { fontWeight: 'bold', marginTop: 10 },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        padding: 8,
        marginTop: 4
    },
    button: {
        backgroundColor: '#2980b9',
        padding: 12,
        borderRadius: 8,
        marginTop: 20
    },
    buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' }
});


// ObraForm.js
/*
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

export default function ObraForm() {
    const [nome, setNome] = useState('');
    const [descricao, setDescricao] = useState('');
    const [linkAfiliado, setLinkAfiliado] = useState('');
    const [imagemLivro, setImagemLivro] = useState('');
    const [genero, setGenero] = useState('');

    const navigation = useNavigation();
    const route = useRoute();
    const { idObra, idAutor } = route.params;

    useEffect(() => {
        if (idObra) {
            fetch(`https://hubleitoresapi.onrender.com/api/v1/obrasautores`)
                .then(res => res.json())
                .then(response => {
                    const obra = response.data.find(o => o._id === idObra);
                    if (obra) {
                        setNome(obra.nome);
                        setDescricao(obra.descricao);
                        setLinkAfiliado(obra.linkAfiliado);
                        setImagemLivro(obra.imagemLivro);
                        setGenero(obra.genero || '');
                    }
                })
                .catch(error => console.error('Erro ao carregar obra:', error));
        }
    }, [idObra]);

    const salvarObra = () => {
        if (!nome || !descricao || !linkAfiliado || !imagemLivro) {
            Alert.alert('Erro', 'Preencha todos os campos!');
            return;
        }

        const obra = { idAutor, nome, descricao, linkAfiliado, imagemLivro, genero };

        const url = idObra
            ? `https://hubleitoresapi.onrender.com/api/v1/obrasautores/${idObra}`
            : 'https://hubleitoresapi.onrender.com/api/v1/obrasautores';

        const method = idObra ? 'PUT' : 'POST';

        fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(obra)
        })
            .then(res => {
                if (res.ok) {
                    Alert.alert('Sucesso', `Obra ${idObra ? 'atualizada' : 'cadastrada'} com sucesso!`);
                    navigation.goBack();
                } else {
                    res.text().then(texto => {
                        console.error('Erro:', texto);
                        Alert.alert('Erro', 'Não foi possível salvar a obra.');
                    });
                }
            })
            .catch(err => {
                console.error('Erro de rede:', err);
                Alert.alert('Erro', 'Erro de rede ao salvar obra.');
            });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Nome da Obra:</Text>
            <TextInput style={styles.input} value={nome} onChangeText={setNome} />

            <Text style={styles.label}>Descrição:</Text>
            <TextInput style={styles.input} value={descricao} onChangeText={setDescricao} multiline />

            <Text style={styles.label}>Gênero:</Text>
            <Picker
                selectedValue={genero}
                style={styles.input}
                onValueChange={(itemValue) => setGenero(itemValue)}
            >
                <Picker.Item label="Selecione um gênero..." value="" />
                <Picker.Item label="Drama" value="Drama" />
                <Picker.Item label="Ficção" value="Ficção" />
                <Picker.Item label="Romance" value="Romance" />
                <Picker.Item label="Aventura" value="Aventura" />
                <Picker.Item label="Terror" value="Terror" />
                <Picker.Item label="Fantasia" value="Fantasia" />
                <Picker.Item label="Biografia" value="Biografia" />
                <Picker.Item label="Poesia" value="Poesia" />
                <Picker.Item label="Outro" value="Outro" />
            </Picker>

            <Text style={styles.label}>Link Afiliado:</Text>
            <TextInput style={styles.input} value={linkAfiliado} onChangeText={setLinkAfiliado} />

            <Text style={styles.label}>URL da Imagem da Capa:</Text>
            <TextInput style={styles.input} value={imagemLivro} onChangeText={setImagemLivro} />

            <TouchableOpacity style={styles.button} onPress={salvarObra}>
                <Text style={styles.buttonText}>{idObra ? 'Atualizar' : 'Cadastrar'} Obra</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { padding: 16 },
    label: { fontWeight: 'bold', marginTop: 10 },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        padding: 8,
        marginTop: 4
    },
    button: {
        backgroundColor: '#2980b9',
        padding: 12,
        borderRadius: 8,
        marginTop: 20
    },
    buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' }
});

*/
