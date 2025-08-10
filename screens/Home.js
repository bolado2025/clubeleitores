import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Platform, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { formatarData, calcularDiferencaDias } from '../utils/dateUtils';
import AutoresFavoritos from '../components/AutoresFavoritos';
import NoticiasList from '../components/NoticiasList';
import { useAuth } from '../AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import showAlert from '../utils/alertUtils';

export default function Home() {

    const [eventos, setEventos] = useState([]);
    const [favoritos, setFavoritos] = useState([]);
    const [idUser, setIdUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();
    const { userInfo, syncWithBackendnoDelay } = useAuth();

    const endpoint = process.env.EXPO_PUBLIC_AMBIENTE === 'dev'
    ? process.env.EXPO_PUBLIC_API_URL_DEV
    : process.env.EXPO_PUBLIC_API_URL_PROD;



    const carregarEventosAtivos = async () => {
        try {
            console.log('Fazendo request para:', `${endpoint}/eventos/ativos?quantidade=2`);
            const response = await fetch(`${endpoint}/eventos/ativos?quantidade=2`);
            
            console.log('Status da resposta:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Conteúdo do erro:', errorText);
                throw new Error(`Erro na resposta da API: ${response.status} - ${errorText}`);
            }
    
            const data = await response.json();
            console.log('Dados recebidos:', data);
    
            if (data && data.data) {
                setEventos(data.data);
            } else {
                console.warn('Resposta inesperada da API:', data);
            }
        } catch (error) {
            console.error('Erro completo ao buscar eventos ativos:', error);
        }
    };

    const carregarEventosFavoritos = async () => {
        console.log('Iniciando carregamento de eventos favoritos...');
        
        try {
            setLoading(true);
            console.log('Definido estado de loading como true.');
    
            // Recupera os dados do usuário do AsyncStorage
            const userData = await AsyncStorage.getItem('@user');
            console.log('Dados brutos do usuário recuperados do AsyncStorage:', userData);
    
            const parsedUser = JSON.parse(userData);
            console.log('Dados do usuário após parse JSON:', parsedUser);
    
            const email = parsedUser?.email || '';
            console.log('Email extraído do usuário logado:', email);
    
            if (!email) {
                console.warn("Email do usuário ainda não definido. Encerrando execução.");
                return;
            }
    
            const url = `${endpoint}/users/email/${encodeURIComponent(email)}/favoritos/eventos`;
            console.log('Fazendo requisição para o endpoint:', url);
    
            const response = await fetch(url);
            console.log('Resposta recebida da API:', response);
    
            const data = await response.json();
            console.log('Dados dos eventos favoritos recebidos:', data);
    
            setFavoritos(data);
            console.log('Estado de favoritos atualizado com os dados recebidos.');
        } catch (error) {
            console.error('Erro ao buscar favoritos:', error);
        } finally {
            setLoading(false);
            console.log('Estado de loading definido como false. Finalizado carregamento.');
        }
    };
    

    const carregarFavoritos = async (idUser) => {
        try {
            setLoading(true);
            console.log("Id do Usuario logado ------------------------> ", idUser);

            if (!idUser) {
                console.warn("ID do usuário ainda não definido.");
                return;
            }
            const response = await fetch(`${endpoint}/users/${idUser}/favoritos/eventos`);
            const data = await response.json();
            setFavoritos(data);
        } catch (error) {
            console.error('Erro ao buscar favoritos:', error);
        } finally {
            setLoading(false);
        }
    };

    const recuperarIdUsuario = async () => {
        try {
            const user = await AsyncStorage.getItem('@user');
            verifyUserIdWithBackend(JSON.parse(user));
        } catch (error) {
            console.error('Erro ao recuperar usuário do AsyncStorage:', error);
        }
    };

    const verifyUserIdWithBackend = async (user) => {
        try {
            console.log('Iniciando verificação de usuário com o backend...');
            console.log('Usuário recuperado do AsyncStorage:', user);
            const requestBody = { email: user.email };
            console.log('Payload da requisição:', requestBody);

            const response = await fetch(`${endpoint}/users/verifyUserId`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.accessToken}`
                },
                body: JSON.stringify(requestBody)
            });

            console.log('Status da resposta:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.log('Erro na resposta da API:', errorText);
                //throw new Error('User verification failed');
            }

            const data = await response.json();
            console.log('Dados retornados da API:', data);

            if (data.userId) {
                console.log('ID do usuário retornado pela API:', data.userId);
                setIdUser(data.userId);
                carregarFavoritos(data.userId);
            } else {
                console.log('Resposta da API não contém userId');
            }

        } catch (error) {
            console.log('Erro ao verificar o usuário:', error);
            //await AsyncStorage.removeItem('@user');
            //setUserInfo(null);
        }
    };

    const getLocalUser = async () => {
        const data = await AsyncStorage.getItem('@user');
        return data ? JSON.parse(data) : null;
    };  

    const sincronizaUsuario = async () => {
        const user = await getLocalUser();

        if (user) {
            console.log('👤 Usuário recuperado com sucesso:');
            Object.entries(user).forEach(([key, value]) => {
                console.log(`🔑 ${key}:`, value);
            });
        } else {
            console.log('⚠️ Nenhum usuário encontrado no AsyncStorage.');
        }
        
        if (user?.localData?.backendUserId == null) {
            console.log("[initializeAuth] BackendUserId não encontrado. Iniciando sincronização...");
            await syncWithBackendnoDelay(user); // Adicionei 'await' para garantir conclusão
            console.log("[initializeAuth] Sincronização com backend concluída!");
        } else {
            console.log("[initializeAuth] Usuário já possui backendUserId. Nenhuma sincronização necessária.");
        }
    }

    const confirmarExclusao = (id) => {
        console.log('Clicou em Excluir - ID:', id);

        if (Platform.OS === 'web') {
            const confirmado = window.confirm('Tem certeza que deseja excluir este evento?');
            if (confirmado) excluirEvento(id);
        } else {
            showAlert (
                'Confirmar Exclusão',
                'Tem certeza que deseja excluir este evento?',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                        text: 'Excluir',
                        onPress: () => excluirEvento(id),
                        style: 'destructive',
                    },
                ]
            );
        }
    };

    const excluirEvento = (id) => {
        console.log('Enviando requisição DELETE para ID:', id);

        fetch(`${endpoint}/eventos/${id}`, {
            method: 'DELETE'
        })
            .then(res => {
                console.log('Status da resposta:', res.status);
                if (res.ok) {
                    showAlert('Sucesso', 'Evento excluído com sucesso!');
                    carregarEventos();
                } else {
                    res.text().then(texto => {
                        console.error('Erro na resposta:', texto);
                        showAlert('Erro', 'Não foi possível excluir o evento.');
                    });
                }
            })
            .catch(err => {
                console.error('Erro de rede:', err);
                showAlert('Erro', 'Erro de rede ao tentar excluir o evento.');
            });
    };

    const toggleFavorito = async (eventoId) => {
        try {
            console.log('Iniciando toggleFavorito...');
            console.log('ID do usuário:', idUser);
            console.log('ID do evento:', eventoId);

            const userData = await AsyncStorage.getItem('@user');
            const parsedUser = JSON.parse(userData);
            const email = parsedUser?.email || '';
            console.log ('email --------------------->', email);
            const emailEncoded = encodeURIComponent(email);

            const response = await fetch(`${endpoint}/users/email/${emailEncoded}/favoritos/eventos/${eventoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.log('Resposta da requisição:', response);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Erro no fetch:', errorData);
                throw new Error('Erro ao atualizar favoritos');
            }

            const data = await response.json();
            console.log('Nova lista de favoritos recebida:', data);
            setFavoritos(data); // Atualiza com a nova lista de favoritos
        } catch (error) {
            console.error('Erro ao atualizar favoritos (try/catch):', error);
        }
    };

    const toggleAtivo = async (id, ativoAtual) => {
        try {

            const url = `${endpoint}/eventos/${id}/ativo`;
            const payload = { ativo: !ativoAtual };

            console.log('🔄 Requisição PATCH para:', url);
            console.log('📦 Payload:', payload);

            const response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const responseBody = await response.text(); // capturar como texto (pode não ser JSON válido)

            if (!response.ok) {
                console.error(`❌ Erro ${response.status} - ${response.statusText}`);
                console.error('📥 Corpo da resposta de erro:', responseBody);
                throw new Error(`Erro na resposta do servidor: ${response.status}`);
            }

            console.log('✅ Status ativo atualizado com sucesso');
            carregarEventos(); // Atualiza a lista
        } catch (error) {
            console.error("Erro ao ativar/desativar:", error);
        }
    };    


    useFocusEffect(
        useCallback(() => {
        //useEffect(() => {   
            /*const carregarTudo = async () => {
                await sincronizaUsuario();                
                await recuperarIdUsuario();
                await carregarEventosAtivos(); // Mudamos para carregarEventosAtivos
            };
            
            const carregarSomenteEventos = async () => {
                await carregarEventosAtivos(); // Mudamos para carregarEventosAtivos
            };

            //if (userInfo) {
                //carregarTudo();
            //} else {
            //    carregarSomenteEventos();
            //}

            carregarSomenteEventos();
            if (userInfo) {
                await carregarEventosFavoritos();
            }*/

            const carregarDados = async () => {
                
                carregarEventosAtivos();
        
                if (userInfo) {
                    await carregarEventosFavoritos();
                } else {
                    console.warn('Usuário ainda não disponível para carregar favoritos');
                }
            };
        
            carregarDados();    

        }, [userInfo])
    );

    const renderItem = ({ item }) => {
        const isFavorito = favoritos.includes(item._id); // Verifica se está na lista de favoritos
        return (
        <View key={item._id} style={styles.card}>
            {/* Imagem do evento à esquerda */}

            {(item.imagemBinaria || item.imagem) && (
                <Image
                    source={{
                        uri: item.imagemBinaria
                            ? `${endpoint}/eventos/${item._id}/imagem` // Cache busting
                            : item.imagem
                    }}
                    style={styles.image}
                    resizeMode="cover"
                    onError={(e) => console.log('Erro ao carregar imagem:', e.nativeEvent.error)}
                />
            )}                    

            <View style={styles.cardContent}>

                <Text style={styles.name}>{item.nome}</Text>
                <Text style={styles.tipoEvento}>{item.tipoEvento}</Text>
                <Text style={styles.info}>Estado: {item.estado}</Text>
                <Text style={styles.info}>Início: {formatarData(item.dataInicial)}</Text>
                {item.dataFinal && <Text style={styles.info}>Término: {formatarData(item.dataFinal)}</Text>}
                <Text style={styles.info2}>Faltam: {calcularDiferencaDias(formatarData(item.dataInicial))} dias.</Text>

                <View style={styles.buttons}>
                    <TouchableOpacity onPress={() => navigation.navigate('EventoDetails', { id: item._id })}>
                        <Text style={styles.link}>Saber Mais..</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('Programacao', { idEvento: item._id })}>
                        <Text style={styles.link}>Programação</Text>
                    </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                if (!userInfo) {
                                showAlert("Dica", "Você precisa estar logado para favoritar um evento.");
                                return;
                                }
                                toggleFavorito(item._id); }}
                            >
                            <Text style={{ fontSize: 16 }}>
                                {isFavorito ? '❤️' : '🤍'}
                            </Text>
                        </TouchableOpacity>
                    
                </View>
            </View>
        </View>
        );
    };    

    const navegarParaLista = (tipo) => {
        navigation.navigate('EventoList', { tipo });
    };

    return (
        <View style={styles.container}>
          {/* Cabeçalho FIXO */}
          <View style={styles.headerFixed}>
            <AutoresFavoritos navigation={navigation} />
            
            {/* Botões de navegação FIXOS */}
            <View style={styles.botoesContainer}>
              <TouchableOpacity 
                style={styles.botao}
                onPress={() => navegarParaLista('todos')}
              >
                <Text style={styles.botaoTexto}>Todos</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.botao}
                onPress={() => navegarParaLista('Feira Literária')}
              >
                <Text style={styles.botaoTexto}>Feiras</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.botao}
                onPress={() => navegarParaLista('Lançamento de Livro')}
              >
                <Text style={styles.botaoTexto}>Novos</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.botao}
                onPress={() => navegarParaLista('Outros')}
              >
                <Text style={styles.botaoTexto}>Outros</Text>
              </TouchableOpacity>
            </View>
          </View>
      
          {/* Conteúdo ROLÁVEL (eventos + notícias + banner) */}
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Lista de eventos - agora usando map em vez de FlatList */}
            {eventos.length > 0 ? (
              <View style={styles.eventosContainer}>
                {eventos.map((item) => renderItem({ item }))}
              </View>
            ) : (
              <Text style={styles.emptyText}>Nenhum evento encontrado.</Text>
            )}
      
            {/* Demais componentes roláveis */}
            <View style={{ paddingTop: 4 }}>
              <NoticiasList navigation={navigation} />
            </View>

          </ScrollView>
        </View>
      );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    headerFixed: {
        backgroundColor: '#fff', // Cor de fundo se necessário
        zIndex: 1, // Garante que fique acima do conteúdo
        // Adicione sombra se quiser efeito de elevação
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
      },
    scrollContent: {
        paddingTop: 10, // Espaço abaixo dos botões fixos
        paddingBottom: 100,
    },
    eventosContainer: {
         paddingBottom: 8,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        marginBottom: 12,
        borderRadius: 8,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    image: {
        width: 100,
        height: '100%',
        backgroundColor: '#e0e0e0'
    },
    cardContent: {
        flex: 1,
        padding: 16,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
        color: '#2c3e50'
    },
    tipoEvento: {
        fontSize: 14,
        color: '#3498db',
        marginBottom: 8,
        fontWeight: '500'
    },
    info: {
        fontSize: 13,
        marginBottom: 4,
        color: '#555'
    },
    info2: {
        fontSize: 13,
        marginBottom: 4,
        color: '#4a5568',              // Cinza-azulado escuro
        fontWeight: '500',
        borderLeftWidth: 3,            // Borda lateral esquerda
        borderLeftColor: '#3182ce',    // Azul como destaque
        paddingLeft: 8                 // Espaço após a borda
    },
    buttons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 12
    },
    link: {
        color: 'blue',
        paddingVertical: 4,
        paddingHorizontal: 8,
        backgroundColor: '#f0f8ff',
        borderRadius: 4,
        fontSize: 13
    },
    addButton: {
        marginTop: 16,
        backgroundColor: '#3498db',
        padding: 12,
        borderRadius: 8
    },
    addText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold'
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#777'
    },    
    botoesContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        paddingHorizontal: 8,
    },
    botao: {
        backgroundColor: '#bbbbbb',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        flex: 1,
        marginHorizontal: 4,
        alignItems: 'center',
    },
    botaoTexto: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 16,
    },
});