import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function Programacao() {
    const [programacao, setProgramacao] = useState([]);
    const [evento, setEvento] = useState(null);
    
    const navigation = useNavigation();
    const route = useRoute();
    const { idEvento } = route.params;

    useEffect(() => {
        carregarEvento();
        carregarProgramacao();
    }, [idEvento]);

    const showAlert = (title, message) => {
        // Verifica se é web (considerando Platform ou fallback)
        const isWeb = Platform ? (Platform.OS === 'web') : (typeof window !== 'undefined' && window.alert);

        if (isWeb) {
            window.alert(message ? `${title}\n${message}` : title);
        } else {
            Alert.alert(title, message);
        }
    };

    const excluirProgramacao = async (id) => {
        try {
            console.log("ID para exclusão:", id); // Adicione isto para verificar o ID

            const response = await fetch(`https://hubleitoresapi.onrender.com/api/v1/programacaoeventos/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    // Adicione autorização se necessário
                    // 'Authorization': 'Bearer ' + seuToken
                }
            });

            console.log("Status da resposta:", response.status); // Verifique o status

            if (!response.ok) {
                const errorData = await response.text(); // Mude para text() para ver o erro cru
                console.log("Resposta de erro:", errorData);
                throw new Error(errorData || 'Erro ao excluir programação');
            }

            console.log("Exclusão bem-sucedida"); // Confirmação
            showAlert('Sucesso', 'Programação excluída com sucesso!');
            carregarProgramacao();
        } catch (error) {
            console.error('Erro completo:', error); // Log completo do erro
            showAlert('Erro', error.message || 'Ocorreu um erro ao excluir a programação.');
        }
    };

    const carregarEvento = () => {
        fetch(`https://hubleitoresapi.onrender.com/api/v1/eventos/${idEvento}`)
            .then(response => response.json())
            .then(data => setEvento(data))
            .catch(error => console.error('Erro ao carregar evento:', error));
    };


    const carregarProgramacao = () => {
        fetch(`https://hubleitoresapi.onrender.com/api/v1/programacaoeventos/evento/${idEvento}`)
            .then(response => response.json())
            .then(data => {
                setEvento(data.evento);
                setProgramacao(data.data || []);
            })
            .catch(error => {
                console.error('Erro:', error);
                setProgramacao([]);
            });
    };    

    const confirmarExclusao = (id) => {
        if (Platform.OS === 'web') {
            // Versão para web usando window.confirm
            const confirmacao = window.confirm('Tem certeza que deseja excluir esta programação?');
            if (confirmacao) {
                excluirProgramacao(id);
            }
        } else {
            // Versão para mobile usando Alert.alert
            Alert.alert(
                'Confirmar Exclusão',
                'Tem certeza que deseja excluir esta programação?',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                        text: 'Excluir',
                        onPress: () => excluirProgramacao(id),
                        style: 'destructive',
                    },
                ]
            );
        }
    };  

    const formatarDataHora = (dataString) => {
        if (!dataString) return '';
        const data = new Date(dataString);
        return data.toLocaleString('pt-BR');
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <Text style={styles.nomeProgramacao}>{item.nomeProgramacao}</Text>
            <Text style={styles.dia}>Dia: {formatarDataHora(item.dia)}</Text>

            {item.schedule.length > 0 && (
                <>
                    <Text style={styles.descricao}>
                        {item.schedule[0].descricaoProgramacao}
                    </Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('ProgramacaoDetails', {
                            programacao: item
                        })}

                    >
                        <Text style={styles.detalhesLink}>Detalhes Programação →</Text>
                    </TouchableOpacity>
                </>
            )}            

            <View style={styles.buttons}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('ProgramacaoForm', {
                        idEvento,
                        idProgramacao: item._id
                    })}
                >
                    <Text style={styles.buttonText}>Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: '#e74c3c' }]}
                    onPress={() => confirmarExclusao(item._id)}
                >
                    <Text style={styles.buttonText}>Excluir</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {evento && (
                <>
                    <Text style={styles.titulo}>Programação: {evento.nome}</Text>
                    <Text style={styles.subtitulo}>{evento.estado} - {evento.endereco}</Text>
                </>
            )}

            <FlatList
                data={programacao}
                keyExtractor={item => item._id}
                renderItem={renderItem}
                ListEmptyComponent={
                    <Text style={styles.semProgramacao}>Nenhuma programação cadastrada</Text>
                }
            />

            <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('ProgramacaoForm', { idEvento })}
            >
                <Text style={styles.addButtonText}>Adicionar Programação</Text>
            </TouchableOpacity>
        </View>
    );

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5'
    },
    titulo: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#2c3e50',
        textAlign: 'center'
    },
    subtitulo: {
        fontSize: 16,
        marginBottom: 20,
        color: '#7f8c8d',
        textAlign: 'center'
    },
    card: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2
    },
    nomeProgramacao: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3498db',
        marginBottom: 5
    },
    dia: {
        fontSize: 14,
        color: '#555',
        marginBottom: 10
    },
    descricao: {
        fontSize: 14,
        color: '#333',
        marginBottom: 15
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'flex-end'
    },
    button: {
        backgroundColor: '#3498db',
        padding: 8,
        borderRadius: 4,
        marginLeft: 10,
        minWidth: 80,
        alignItems: 'center'
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold'
    },
    semProgramacao: {
        textAlign: 'center',
        marginTop: 20,
        fontStyle: 'italic',
        color: '#95a5a6'
    },
    addButton: {
        backgroundColor: '#2ecc71',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16
    },
    detalhesLink: {
        color: '#3498db',
        textDecorationLine: 'underline',
        marginBottom: 15,
        fontSize: 14
    }
});