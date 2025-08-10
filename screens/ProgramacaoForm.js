import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, FlatList, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Modal from 'react-native-modal';

export default function ProgramacaoForm() {
    const [programacao, setProgramacao] = useState({
        nomeProgramacao: '',
        dia: new Date(),
        schedule: [],
        status: true
    });

    const [novaAtracao, setNovaAtracao] = useState({
        atracao: '',
        horaInicio: '',
        horaFim: '',
        descricaoProgramacao: '',
        listaAutores: [],
        listaUsuariosProg: []
    });

    const [usuarios, setUsuarios] = useState([]);
    const [autores, setAutores] = useState([]);
    const [usuariosSelecionados, setUsuariosSelecionados] = useState([]);
    const [autoresSelecionados, setAutoresSelecionados] = useState([]);
    const [modalParticipantes, setModalParticipantes] = useState(false);
    const [currentScheduleIndex, setCurrentScheduleIndex] = useState(null);

    const navigation = useNavigation();
    const route = useRoute();
    const { idEvento, idProgramacao } = route.params;

    const [isAlertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertTitle, setAlertTitle] = useState('');

    const showAlert = (title, message) => {
        setAlertTitle(title);
        setAlertMessage(message);
        setAlertVisible(true);
    };

    useEffect(() => {
        if (idProgramacao) {
            carregarProgramacao();
        }
        carregarUsuarios();
        carregarAutores();
    }, [idProgramacao]);

    const carregarProgramacao = () => {
        fetch(`https://hubleitoresapi.onrender.com/api/v1/programacaoeventos/${idProgramacao}`)
            .then(response => response.json())
            .then(data => {
                setProgramacao({
                    ...data,
                    dia: data.dia ? new Date(data.dia) : new Date()
                });
            })
            .catch(error => console.error('Erro ao carregar programação:', error));
    };

    const carregarUsuarios = () => {
        fetch('https://hubleitoresapi.onrender.com/api/v1/users')
            .then(response => response.json())
            .then(response => setUsuarios(response.data))
            .catch(error => console.error('Erro ao buscar usuários:', error));
    };

    const carregarAutores = () => {
        fetch('https://hubleitoresapi.onrender.com/api/v1/autores')
            .then(response => response.json())
            .then(response => setAutores(response.data))
            .catch(error => console.error('Erro ao buscar autores:', error));
    };

    const handleChange = (name, value) => {
        setProgramacao(prev => ({ ...prev, [name]: value }));
    };

    const handleAtracaoChange = (name, value) => {
        setNovaAtracao(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (campo, text) => {
        if (campo === 'dia') {
            const dateObj = new Date(text);
            if (!isNaN(dateObj)) {
                setProgramacao(prev => ({ ...prev, dia: dateObj }));
            }
        }
    };

    const adicionarAtracao = () => {
        // Validação dos campos obrigatórios
        if (!novaAtracao.atracao || !novaAtracao.horaInicio || !novaAtracao.horaFim) {
            showAlert('Atenção', 'Por favor, preencha todos os campos obrigatórios');
            return;
        }

        // Validação do formato das horas
        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(novaAtracao.horaInicio) || !timeRegex.test(novaAtracao.horaFim)) {
            showAlert('Atenção', 'Formato de hora inválido. Use HH:MM');
            return;
        }

        // Validação se hora fim é maior que hora início
        const [hIni, mIni] = novaAtracao.horaInicio.split(':').map(Number);
        const [hFim, mFim] = novaAtracao.horaFim.split(':').map(Number);

        if (hFim < hIni || (hFim === hIni && mFim <= mIni)) {
            showAlert('Atenção', 'A hora de término deve ser posterior à hora de início');
            return;
        }

        // Adiciona a atração ao schedule
        setProgramacao(prev => ({
            ...prev,
            schedule: [...prev.schedule, novaAtracao]
        }));

        // Reseta o formulário
        setNovaAtracao({
            atracao: '',
            horaInicio: '',
            horaFim: '',
            descricaoProgramacao: '',
            listaAutores: [],
            listaUsuariosProg: []
        });

        showAlert('Sucesso', 'Atração adicionada com sucesso!');
    };

    const removerAtracao = (index) => {
        setProgramacao(prev => {
            const novoSchedule = [...prev.schedule];
            novoSchedule.splice(index, 1);
            return { ...prev, schedule: novoSchedule };
        });
    };

    const abrirModalParticipantes = (index) => {
        setCurrentScheduleIndex(index);
        setAutoresSelecionados(programacao.schedule[index]?.listaAutores || []);
        setUsuariosSelecionados(programacao.schedule[index]?.listaUsuariosProg || []);
        setModalParticipantes(true);
    };

    /*
    const salvarParticipantes = async () => {
        try {
            const programacaoId = idProgramacao;
            const scheduleIndex = currentScheduleIndex;
            const scheduleItem = programacao.schedule[scheduleIndex];

            console.log('[DEBUG] Iniciando salvamento de participantes...');

            // Identifica apenas autores para adicionar
            const autoresParaAdicionar = autoresSelecionados.filter(
                id => !scheduleItem.listaAutores.includes(id)
            );

            console.log('[DEBUG] Autores para adicionar:', autoresParaAdicionar);

            // Processa apenas adição em lote
            if (autoresParaAdicionar.length > 0) {
                const url = `https://hubleitoresapi.onrender.com/api/v1/programacaoeventos/${programacaoId}/schedule/${scheduleIndex}/autores`;

                await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ autores: autoresParaAdicionar })
                });
            }

            // Atualiza estado local
            setProgramacao(prev => {
                const novoSchedule = [...prev.schedule];
                novoSchedule[scheduleIndex] = {
                    ...novoSchedule[scheduleIndex],
                    listaAutores: [...new Set([...scheduleItem.listaAutores, ...autoresSelecionados])], // Garante IDs únicos
                    listaUsuariosProg: usuariosSelecionados
                };
                return { ...prev, schedule: novoSchedule };
            });

            setModalParticipantes(false);
            showAlert('Sucesso', 'Participantes adicionados com sucesso!');
        } catch (error) {
            console.error('[ERRO] Falha no salvamento:', error);
            showAlert('Erro', `Ocorreu um erro: ${error.message}`);
        }
    };

    const removerParticipantes = async () => {
        try {
            const programacaoId = idProgramacao;
            const scheduleIndex = currentScheduleIndex;
            const scheduleItem = programacao.schedule[scheduleIndex];

            console.log('[DEBUG] Iniciando remoção de participantes...');
            console.log('[DEBUG] Autores selecionados:', autoresSelecionados);
            console.log('[DEBUG] Autores atuais no item:', scheduleItem.listaAutores);

            // Convertendo todos os IDs para string para comparação segura
            const autoresAtuais = scheduleItem.listaAutores.map(id => id.toString());
            const selecionados = autoresSelecionados.map(id => id.toString());

            // Identifica autores para remover (os que estão selecionados e já existiam)
            const autoresParaRemover = autoresAtuais.filter(
                id => selecionados.includes(id)
            );

            console.log('[DEBUG] Autores para remover:', autoresParaRemover);

            // Processa remoção em lote
            if (autoresParaRemover.length > 0) {
                const url = `https://hubleitoresapi.onrender.com/api/v1/programacaoeventos/${programacaoId}/schedule/${scheduleIndex}/autores`;

                await fetch(url, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ autores: autoresParaRemover })
                });
            }

            // Atualiza estado local
            setProgramacao(prev => {
                const novoSchedule = [...prev.schedule];
                novoSchedule[scheduleIndex] = {
                    ...novoSchedule[scheduleIndex],
                    listaAutores: scheduleItem.listaAutores.filter(id =>
                        !autoresParaRemover.includes(id.toString())
                    ),
                    listaUsuariosProg: usuariosSelecionados.filter(id =>
                        !autoresParaRemover.includes(id.toString())
                    )
                };
                return { ...prev, schedule: novoSchedule };
            });

            setModalParticipantes(false);
            showAlert('Sucesso', 'Participantes removidos com sucesso!');
        } catch (error) {
            console.error('[ERRO] Falha na remoção:', error);
            showAlert('Erro', `Ocorreu um erro: ${error.message}`);
        }
    };
    */

    const salvarParticipantes = async () => {
        try {
            const programacaoId = idProgramacao;
            const scheduleIndex = currentScheduleIndex;
            const scheduleItem = programacao.schedule[scheduleIndex];

            console.log('[DEBUG] Iniciando salvamento de participantes...');

            // Processamento de Autores (mantido como está)
            const autoresParaAdicionar = autoresSelecionados.filter(
                id => !scheduleItem.listaAutores.includes(id)
            );

            if (autoresParaAdicionar.length > 0) {
                const urlAutores = `https://hubleitoresapi.onrender.com/api/v1/programacaoeventos/${programacaoId}/schedule/${scheduleIndex}/autores`;
                await fetch(urlAutores, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ autores: autoresParaAdicionar })
                });
            }

            // Processamento de Usuários (novo)
            const usuariosParaAdicionar = usuariosSelecionados.filter(
                id => !scheduleItem.listaUsuariosProg?.includes(id)
            );

            console.log('[DEBUG] Usuários para adicionar:', usuariosParaAdicionar);
            console.log('[DEBUG] Tipo dos IDs:', usuariosParaAdicionar.map(id => typeof id));

            if (usuariosParaAdicionar.length > 0) {
                const urlUsuarios = `https://hubleitoresapi.onrender.com/api/v1/programacaoeventos/${programacaoId}/schedule/${scheduleIndex}/usuarios`;

                const requestBody = { usuarios: usuariosParaAdicionar };
                console.log('[DEBUG] Corpo da requisição:', JSON.stringify(requestBody, null, 2));

                try {
                    const response = await fetch(urlUsuarios, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(requestBody)
                    });

                    console.log('[DEBUG] Status da resposta:', response.status);

                    if (!response.ok) {
                        const errorResponse = await response.json().catch(() => ({}));
                        console.error('[DEBUG] Resposta de erro:', errorResponse);
                        throw new Error(`Erro HTTP: ${response.status}`);
                    }

                    const responseData = await response.json();
                    console.log('[DEBUG] Resposta de sucesso:', responseData);
                } catch (error) {
                    console.error('[DEBUG] Erro na requisição:', {
                        message: error.message,
                        stack: error.stack,
                        requestBody: requestBody
                    });
                    throw error;
                }
            }

            // Atualiza estado local
            setProgramacao(prev => {
                const novoSchedule = [...prev.schedule];
                novoSchedule[scheduleIndex] = {
                    ...novoSchedule[scheduleIndex],
                    listaAutores: [...new Set([...scheduleItem.listaAutores, ...autoresSelecionados])],
                    listaUsuariosProg: [...new Set([...(scheduleItem.listaUsuariosProg || []), ...usuariosSelecionados])]
                };
                return { ...prev, schedule: novoSchedule };
            });

            setModalParticipantes(false);
            showAlert('Sucesso', 'Participantes adicionados com sucesso!');
        } catch (error) {
            console.error('[ERRO] Falha no salvamento:', error);
            showAlert('Erro', `Ocorreu um erro: ${error.message}`);
        }
    };

    const removerParticipantes = async () => {
        try {
            const programacaoId = idProgramacao;
            const scheduleIndex = currentScheduleIndex;
            const scheduleItem = programacao.schedule[scheduleIndex];

            console.log('[DEBUG] Iniciando remoção de participantes...');

            // Processamento de Autores (mantido como está)
            const autoresAtuais = scheduleItem.listaAutores.map(id => id.toString());
            const selecionadosAutores = autoresSelecionados.map(id => id.toString());
            const autoresParaRemover = autoresAtuais.filter(id => selecionadosAutores.includes(id));

            if (autoresParaRemover.length > 0) {
                const urlAutores = `https://hubleitoresapi.onrender.com/api/v1/programacaoeventos/${programacaoId}/schedule/${scheduleIndex}/autores`;
                await fetch(urlAutores, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ autores: autoresParaRemover })
                });
            }

            // Processamento de Usuários (novo)
            const usuariosAtuais = (scheduleItem.listaUsuariosProg || []).map(id => id.toString());
            const selecionadosUsuarios = usuariosSelecionados.map(id => id.toString());
            const usuariosParaRemover = usuariosAtuais.filter(id => selecionadosUsuarios.includes(id));

            if (usuariosParaRemover.length > 0) {
                // Remove um usuário por vez (ou poderia adaptar o backend para receber array)
                for (const usuarioId of usuariosParaRemover) {
                    const urlUsuarios = `https://hubleitoresapi.onrender.com/api/v1/programacaoeventos/${programacaoId}/schedule/${scheduleIndex}/usuarios/${usuarioId}`;
                    await fetch(urlUsuarios, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ usuarios: usuariosParaRemover })
                    });
                }
            }

            // Atualiza estado local
            setProgramacao(prev => {
                const novoSchedule = [...prev.schedule];
                novoSchedule[scheduleIndex] = {
                    ...novoSchedule[scheduleIndex],
                    listaAutores: scheduleItem.listaAutores.filter(id =>
                        !autoresParaRemover.includes(id.toString())
                    ),
                    listaUsuariosProg: (scheduleItem.listaUsuariosProg || []).filter(id =>
                        !usuariosParaRemover.includes(id.toString())
                    )
                };
                return { ...prev, schedule: novoSchedule };
            });

            setModalParticipantes(false);
            showAlert('Sucesso', 'Participantes removidos com sucesso!');
        } catch (error) {
            console.error('[ERRO] Falha na remoção:', error);
            showAlert('Erro', `Ocorreu um erro: ${error.message}`);
        }
    };

    const toggleUsuario = (usuarioId) => {
        setUsuariosSelecionados(prev =>
            prev.includes(usuarioId)
                ? prev.filter(id => id !== usuarioId)
                : [...prev, usuarioId]
        );
    };

    const toggleAutor = (autorId) => {
        setAutoresSelecionados(prev =>
            prev.includes(autorId)
                ? prev.filter(id => id !== autorId)
                : [...prev, autorId]
        );
    };

    const salvarProgramacao = () => {
        if (!programacao.nomeProgramacao) {
            Alert.alert('Atenção', 'Por favor, informe o nome da programação');
            return;
        }

        if (!programacao.dia) {
            Alert.alert('Atenção', 'Por favor, selecione a data');
            return;
        }

        if (programacao.schedule.length === 0) {
            Alert.alert('Atenção', 'Por favor, adicione pelo menos uma atração');
            return;
        }

        const programacaoParaSalvar = {
            ...programacao,
            evento: idEvento
        };

        const url = idProgramacao
            ? `https://hubleitoresapi.onrender.com/api/v1/programacaoeventos/${idProgramacao}`
            : `https://hubleitoresapi.onrender.com/api/v1/programacaoeventos/evento/${idEvento}`;

        const method = idProgramacao ? 'PUT' : 'POST';

        console.log('url ', url);
        console.log('method ', method);

        fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(programacaoParaSalvar)
        })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => { throw new Error(text) });
                }
                return response.json();
            })
            .then(() => {
                Alert.alert('Sucesso', idProgramacao ? 'Programação atualizada com sucesso!' : 'Programação criada com sucesso!');
                navigation.goBack();
            })
            .catch(error => {
                console.error('Erro:', error);
                Alert.alert('Erro', 'Ocorreu um erro ao salvar a programação.');
            });
    };

    const renderAtracao = ({ item, index }) => (
        <View style={styles.atracaoItem}>
            <View style={styles.atracaoInfo}>
                <Text style={styles.atracaoText}>{item.horaInicio} - {item.horaFim}: {item.atracao}</Text>
                {item.descricaoProgramacao && <Text style={styles.atracaoDesc}>{item.descricaoProgramacao}</Text>}
                <View style={styles.participantesContainer}>
                    {item.listaAutores?.length > 0 && (
                        <Text style={styles.participantesText}>
                            Autores: {item.listaAutores.length}
                        </Text>
                    )}
                    {item.listaUsuariosProg?.length > 0 && (
                        <Text style={styles.participantesText}>
                            Usuários: {item.listaUsuariosProg.length}
                        </Text>
                    )}
                </View>
            </View>
            <View style={styles.atracaoActions}>
                <TouchableOpacity
                    style={styles.gerirParticipantesButton}
                    onPress={() => abrirModalParticipantes(index)}
                >
                    <Text style={styles.gerirParticipantesText}>Participantes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.removerAtracao}
                    onPress={() => removerAtracao(index)}
                >
                    <Text style={styles.removerAtracaoText}>×</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.label}>Nome da Programação*</Text>
            <TextInput
                style={styles.input}
                value={programacao.nomeProgramacao}
                onChangeText={(text) => handleChange('nomeProgramacao', text)}
                placeholder="Ex: Palestra sobre Literatura Contemporânea"
                maxLength={100}
            />

            <Text style={styles.label}>Data*</Text>
            <TextInput
                style={styles.input}
                value={programacao.dia ? new Date(programacao.dia).toISOString().split('T')[0] : ''}
                onChangeText={(text) => handleDateChange('dia', text)}
                placeholder="aaaa-mm-dd"
                keyboardType="default"
            />

            <Text style={styles.sectionTitle}>Atrações da Programação</Text>

            <FlatList
                data={programacao.schedule}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderAtracao}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>Nenhuma atração adicionada</Text>
                }
                style={styles.atracoesList}
            />

            <Text style={styles.label}>Nova Atração*</Text>
            <TextInput
                style={styles.input}
                value={novaAtracao.atracao}
                onChangeText={(text) => handleAtracaoChange('atracao', text)}
                placeholder="Nome da atração"
            />

            <View style={styles.horariosContainer}>
                <View style={styles.horarioInputContainer}>
                    <Text style={styles.label}>Hora Início*</Text>
                    <TextInput
                        style={styles.input}
                        value={novaAtracao.horaInicio}
                        onChangeText={(text) => handleAtracaoChange('horaInicio', text)}
                        placeholder="hh:mm"
                        keyboardType="numeric"
                    />
                </View>
                <View style={styles.horarioInputContainer}>
                    <Text style={styles.label}>Hora Fim*</Text>
                    <TextInput
                        style={styles.input}
                        value={novaAtracao.horaFim}
                        onChangeText={(text) => handleAtracaoChange('horaFim', text)}
                        placeholder="hh:mm"
                        keyboardType="numeric"
                    />
                </View>
            </View>

            <Text style={styles.label}>Descrição (opcional)</Text>
            <TextInput
                style={[styles.input, { height: 80 }]}
                value={novaAtracao.descricaoProgramacao}
                onChangeText={(text) => handleAtracaoChange('descricaoProgramacao', text)}
                placeholder="Detalhes sobre a atração"
                multiline
            />

            <TouchableOpacity
                style={styles.addButton}
                onPress={adicionarAtracao}
            >
                <Text style={styles.addButtonText}>Adicionar Atração</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveButton} onPress={salvarProgramacao}>
                <Text style={styles.saveButtonText}>
                    {idProgramacao ? 'Atualizar Programação' : 'Salvar Programação'}
                </Text>
            </TouchableOpacity>

            {/* Modal de Participantes */}
            <Modal isVisible={modalParticipantes}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Gerir Participantes</Text>

                    <Text style={styles.modalSectionTitle}>Autores</Text>
                    <ScrollView style={styles.modalScroll}>
                        {autores.map(autor => (
                            <TouchableOpacity
                                key={autor._id}
                                style={[
                                    styles.participanteItem,
                                    autoresSelecionados.includes(autor._id) && styles.participanteSelecionado
                                ]}
                                onPress={() => toggleAutor(autor._id)}
                            >
                                <Text>{autor.nome}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <Text style={styles.modalSectionTitle}>Usuários</Text>
                    <ScrollView style={styles.modalScroll}>
                        {usuarios.map(usuario => (
                            <TouchableOpacity
                                key={usuario._id}
                                style={[
                                    styles.participanteItem,
                                    usuariosSelecionados.includes(usuario._id) && styles.participanteSelecionado
                                ]}
                                onPress={() => toggleUsuario(usuario._id)}
                            >
                                <Text>{usuario.nome}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <View style={styles.modalButtons}>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.modalCancelButton]}
                            onPress={() => setModalParticipantes(false)}
                        >
                            <Text style={styles.modalButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={salvarParticipantes}
                        >
                            <Text style={styles.modalButtonText}>Salvar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.modalRemoveButton]}
                            onPress={removerParticipantes}
                        >
                            <Text style={styles.modalButtonText}>Remover</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal isVisible={isAlertVisible}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>{alertTitle}</Text>
                    <Text style={styles.modalMessage}>{alertMessage}</Text>
                    <TouchableOpacity
                        style={styles.modalButton}
                        onPress={() => setAlertVisible(false)}
                    >
                        <Text style={styles.modalButtonText}>OK</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff'
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        fontWeight: 'bold',
        color: '#333'
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
        color: '#2c3e50'
    },
    input: {
        height: 50,
        borderColor: '#ddd',
        borderWidth: 1,
        marginBottom: 16,
        paddingHorizontal: 10,
        borderRadius: 4,
        backgroundColor: '#f9f9f9'
    },
    horariosContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    horarioInputContainer: {
        width: '48%'
    },
    atracoesList: {
        maxHeight: 300,
        marginBottom: 16
    },
    atracaoItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#f8f9fa',
        borderRadius: 4,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#e9ecef'
    },
    atracaoInfo: {
        flex: 1
    },
    atracaoText: {
        fontSize: 14,
        fontWeight: '500'
    },
    atracaoDesc: {
        fontSize: 12,
        color: '#6c757d',
        marginTop: 4
    },
    participantesContainer: {
        flexDirection: 'row',
        marginTop: 8
    },
    participantesText: {
        fontSize: 12,
        color: '#3498db',
        marginRight: 12
    },
    atracaoActions: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    gerirParticipantesButton: {
        padding: 6,
        backgroundColor: '#3498db',
        borderRadius: 4,
        marginRight: 8
    },
    gerirParticipantesText: {
        color: 'white',
        fontSize: 12
    },
    removerAtracao: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#e74c3c',
        justifyContent: 'center',
        alignItems: 'center'
    },
    removerAtracaoText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        lineHeight: 20
    },
    addButton: {
        backgroundColor: '#2ecc71',
        padding: 12,
        borderRadius: 4,
        alignItems: 'center',
        marginBottom: 16
    },
    addButtonText: {
        color: 'white',
        fontWeight: 'bold'
    },
    saveButton: {
        backgroundColor: '#3498db',
        padding: 15,
        borderRadius: 4,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 30
    },
    saveButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16
    },
    emptyText: {
        textAlign: 'center',
        color: '#95a5a6',
        fontStyle: 'italic',
        marginVertical: 10
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 8,
        maxHeight: '80%'
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center'
    },
    modalSectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5
    },
    modalScroll: {
        maxHeight: 150,
        marginBottom: 10
    },
    participanteItem: {
        padding: 10,
        marginVertical: 2,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        backgroundColor: '#f5f5f5'
    },
    participanteSelecionado: {
        backgroundColor: '#d4e6f1',
        borderColor: '#3498db'
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15
    },
    modalButton: {
        backgroundColor: '#3498db',
        padding: 10,
        borderRadius: 4,
        minWidth: 100,
        alignItems: 'center'
    },
    modalCancelButton: {
        backgroundColor: '#95a5a6'
    },
    modalButtonText: {
        color: 'white',
        fontWeight: 'bold'
    },
    modalMessage: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center'
    }
});

/*
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, FlatList, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Modal from 'react-native-modal';


export default function ProgramacaoForm() {
    const [programacao, setProgramacao] = useState({
        nomeProgramacao: '',
        dia: new Date(),
        schedule: [],
        listaUsuariosProg: [],
        status: true
    });

    const [novoHorario, setNovoHorario] = useState({
        atracao: '',
        hora: '',
        descricaoProgramacao: ''
    });

    const [usuarios, setUsuarios] = useState([]);
    const [usuariosSelecionados, setUsuariosSelecionados] = useState([]);
    const navigation = useNavigation();
    const route = useRoute();
    const { idEvento, idProgramacao } = route.params;

    const [isAlertVisible, setAlertVisible] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertTitle, setAlertTitle] = useState('');

    const showAlert = (title, message) => {
        setAlertTitle(title);
        setAlertMessage(message);
        setAlertVisible(true);
    };

    useEffect(() => {
        if (idProgramacao) {
            carregarProgramacao();
        }
        carregarUsuarios();
    }, [idProgramacao]);

    const carregarProgramacao = () => {
        fetch(`https://hubleitoresapi.onrender.com/api/v1/programacaoeventos/${idProgramacao}`)
            .then(response => response.json())
            .then(data => {
                setProgramacao({
                    ...data,
                    dia: data.dia ? new Date(data.dia) : new Date()
                });
                setUsuariosSelecionados(data.listaUsuariosProg || []);
            })
            .catch(error => console.error('Erro ao carregar programação:', error));
    };

    const carregarUsuarios = () => {
        fetch('https://hubleitoresapi.onrender.com/api/v1/users')
            .then(response => response.json())
            .then(response => setUsuarios(response.data))
            .catch(error => console.error('Erro ao buscar usuários:', error));
    };

    const handleChange = (name, value) => {
        setProgramacao(prev => ({ ...prev, [name]: value }));
    };

    const handleHorarioChange = (name, value) => {
        setNovoHorario(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (campo, text) => {
        if (campo === 'dia') {
            const dateObj = new Date(text);
            if (!isNaN(dateObj)) {
                setProgramacao(prev => ({ ...prev, dia: dateObj }));
            }
        } else {
            // Exemplo para outros campos como 'hora'
            setProgramacao(prev => ({ ...prev, [campo]: text }));
        }
    };

    const adicionarHorario = () => {
        // Verificação dos campos
        if (!novoHorario.atracao || !novoHorario.hora) {
            showAlert('Atenção', 'Por favor, preencha a atração e a hora');
            return;
        }

        // Adiciona o horário
        setProgramacao(prev => ({
            ...prev,
            schedule: [...prev.schedule, novoHorario]
        }));

        // Reseta o formulário
        setNovoHorario({
            atracao: '',
            hora: '',
            descricaoProgramacao: ''
        });

        // Feedback visual
        showAlert('Sucesso', 'Horário adicionado com sucesso!', 'success');
    };    

   
    const removerHorario = (index) => {
        setProgramacao(prev => {
            const novoSchedule = [...prev.schedule];
            novoSchedule.splice(index, 1);
            return { ...prev, schedule: novoSchedule };
        });
    };

    const toggleUsuario = (usuarioId) => {
        setUsuariosSelecionados(prev =>
            prev.includes(usuarioId)
                ? prev.filter(id => id !== usuarioId)
                : [...prev, usuarioId]
        );
    };

    const salvarProgramacao = () => {
        if (!programacao.nomeProgramacao) {
            Alert.alert('Atenção', 'Por favor, informe o nome da programação');
            return;
        }

        if (!programacao.dia) {
            Alert.alert('Atenção', 'Por favor, selecione a data');
            return;
        }

        const programacaoParaSalvar = {
            ...programacao,
            listaUsuariosProg: usuariosSelecionados,
            evento: idEvento
        };

        const url = idProgramacao
            ? `https://hubleitoresapi.onrender.com/api/v1/programacaoeventos/${idProgramacao}`
            : `https://hubleitoresapi.onrender.com/api/v1/programacaoeventos/evento/${idEvento}`;

        const method = idProgramacao ? 'PUT' : 'POST';

        fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(programacaoParaSalvar)
        })
            .then(response => {
                if (!response.ok) {
                    return response.text().then(text => { throw new Error(text) });
                }
                return response.json();
            })
            .then(() => {
                Alert.alert('Sucesso', idProgramacao ? 'Programação atualizada com sucesso!' : 'Programação criada com sucesso!');
                navigation.goBack();
            })
            .catch(error => {
                console.error('Erro:', error);
                Alert.alert('Erro', 'Ocorreu um erro ao salvar a programação.');
            });
    };

    const renderHorario = ({ item, index }) => (
        <View style={styles.horarioItem}>
            <View style={styles.horarioInfo}>
                <Text style={styles.horarioText}>{item.hora} - {item.atracao}</Text>
                {item.descricaoProgramacao && <Text style={styles.horarioDesc}>{item.descricaoProgramacao}</Text>}
            </View>
            <TouchableOpacity
                style={styles.removerHorario}
                onPress={() => removerHorario(index)}
            >
                <Text style={styles.removerHorarioText}>×</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.label}>Nome da Programação*</Text>
            <TextInput
                style={styles.input}
                value={programacao.nomeProgramacao}
                onChangeText={(text) => handleChange('nomeProgramacao', text)}
                placeholder="Ex: Palestra sobre Literatura Contemporânea"
                maxLength={100}
            />

            <Text style={styles.label}>Data*</Text>
            <TextInput
                style={styles.input}
                value={programacao.dia ? new Date(programacao.dia).toISOString().split('T')[0] : ''}
                onChangeText={(text) => handleDateChange('dia', text)}
                placeholder="aaa-mm-dd"
                keyboardType="default"
            />

            <Text style={styles.sectionTitle}>Horários da Programação</Text>

            <FlatList
                data={programacao.schedule}
                keyExtractor={(item, index) => index.toString()}
                renderItem={renderHorario}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>Nenhum horário adicionado</Text>
                }
                style={styles.horariosList}
            />

            <Text style={styles.label}>Nova Atração</Text>
            <TextInput
                style={styles.input}
                value={novoHorario.atracao}
                onChangeText={(text) => handleHorarioChange('atracao', text)}
                placeholder="Nome da atração"
            />

            <Text style={styles.label}>Hora*</Text>
            <TextInput
                style={styles.input}
                value={novoHorario.hora}
                onChangeText={(text) => handleHorarioChange('hora', text)}
                placeholder="hh:mm"
                keyboardType="numeric"
            />

            <Text style={styles.label}>Descrição (opcional)</Text>
            <TextInput
                style={[styles.input, { height: 80 }]}
                value={novoHorario.descricaoProgramacao}
                onChangeText={(text) => handleHorarioChange('descricaoProgramacao', text)}
                placeholder="Detalhes sobre a atração"
                multiline
            />

            <TouchableOpacity
                style={styles.addButton}
                onPress={adicionarHorario}
            >
                <Text style={styles.addButtonText}>Adicionar Horário</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Participantes</Text>
            <View style={styles.usuariosContainer}>
                {usuarios.map(usuario => (
                    <TouchableOpacity
                        key={usuario._id}
                        style={[
                            styles.usuarioItem,
                            usuariosSelecionados.includes(usuario._id) && styles.usuarioSelecionado
                        ]}
                        onPress={() => toggleUsuario(usuario._id)}
                    >
                        <Text>{usuario.nome}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={salvarProgramacao}>
                <Text style={styles.saveButtonText}>
                    {idProgramacao ? 'Atualizar Programação' : 'Salvar Programação'}
                </Text>
            </TouchableOpacity>

            <Modal isVisible={isAlertVisible}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>{alertTitle}</Text>
                    <Text style={styles.modalMessage}>{alertMessage}</Text>
                    <TouchableOpacity
                        style={styles.modalButton}
                        onPress={() => setAlertVisible(false)}                    >
                        <Text style={styles.modalButtonText}>OK</Text>
                    </TouchableOpacity>
                </View>
            </Modal>


        </ScrollView>
        
        
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff'
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        fontWeight: 'bold',
        color: '#333'
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
        color: '#2c3e50'
    },
    input: {
        height: 50,
        borderColor: '#ddd',
        borderWidth: 1,
        marginBottom: 16,
        paddingHorizontal: 10,
        borderRadius: 4,
        backgroundColor: '#f9f9f9'
    },
    dateInput: {
        height: 50,
        borderColor: '#ddd',
        borderWidth: 1,
        marginBottom: 16,
        paddingHorizontal: 10,
        borderRadius: 4,
        backgroundColor: '#f9f9f9',
        justifyContent: 'center'
    },
    horariosList: {
        maxHeight: 200,
        marginBottom: 16
    },
    horarioItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#f8f9fa',
        borderRadius: 4,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#e9ecef'
    },
    horarioInfo: {
        flex: 1
    },
    horarioText: {
        fontSize: 14,
        fontWeight: '500'
    },
    horarioDesc: {
        fontSize: 12,
        color: '#6c757d',
        marginTop: 4
    },
    removerHorario: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: '#e74c3c',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10
    },
    removerHorarioText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        lineHeight: 20
    },
    usuariosContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 16
    },
    usuarioItem: {
        padding: 8,
        margin: 4,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        backgroundColor: '#f5f5f5'
    },
    usuarioSelecionado: {
        backgroundColor: '#d4e6f1',
        borderColor: '#3498db'
    },
    addButton: {
        backgroundColor: '#2ecc71',
        padding: 12,
        borderRadius: 4,
        alignItems: 'center',
        marginBottom: 16
    },
    addButtonText: {
        color: 'white',
        fontWeight: 'bold'
    },
    saveButton: {
        backgroundColor: '#3498db',
        padding: 15,
        borderRadius: 4,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 30
    },
    saveButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16
    },
    emptyText: {
        textAlign: 'center',
        color: '#95a5a6',
        fontStyle: 'italic',
        marginVertical: 10
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 8,
        alignItems: 'center'
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10
    },
    modalMessage: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center'
    },
    modalButton: {
        backgroundColor: '#3498db',
        padding: 10,
        borderRadius: 4,
        minWidth: 100,
        alignItems: 'center'
    },
    modalButtonText: {
        color: 'white',
        fontWeight: 'bold'
    }

});

*/