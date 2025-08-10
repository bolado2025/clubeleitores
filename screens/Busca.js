import React, { useState, useEffect } from 'react';
import { FlatList, TouchableOpacity, View, StyleSheet } from 'react-native';
import { TextInput, Button, List, ActivityIndicator, SegmentedButtons } from 'react-native-paper';
//import AdMobBanner from '../components/AdMobBanner';

const API_BASE_URL = 'https://hubleitoresapi.onrender.com/api/v1'; // Substitua pela URL do seu backend

const Busca = ({ navigation }) => {
    const [searchText, setSearchText] = useState('');
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchType, setSearchType] = useState('autores');
    
    // Função para construir query string a partir de objeto
    const buildQueryString = (params) => {
        return Object.keys(params)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
            .join('&');
    };

    // Buscar dados iniciais
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                const endpoint = searchType === 'autores' ? '/autores' : '/eventos';
                const params = {
                    limit: 20,
                    page: 1,
                    status: true,
                    ativo: true
                };
                
                const queryString = buildQueryString(params);
                const url = `${API_BASE_URL}${endpoint}?${queryString}`;
                
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Erro HTTP: ${response.status}`);
                }
                const result = await response.json();
                
                setData(result.data);
            } catch (error) {
                console.error(`Erro ao buscar ${searchType}: `, error);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [searchType]);

    // Função para filtrar sugestões (autocomplete)
    const handleAutocomplete = (text) => {
        setSearchText(text);
        if (text.length > 1) {
            const filtered = data.filter(item =>
                item.nome && item.nome.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredData(filtered);
        } else {
            setFilteredData([]);
        }
    };

    // Quando uma sugestão é selecionada
    const onAutocompleteSelect = (item) => {
        setSearchText(item.nome);
        setFilteredData([]);
        handleSearch(item.nome, true);
    };

    // Realizar a busca
    const handleSearch = async (text, exactMatch = false) => {
        setLoading(true);

        try {
            const endpoint = searchType === 'autores' ? '/autores' : '/eventos';
            const params = {
                limit: 20,
                page: 1,
                status: true,
                ativo: true
            };

            // Adiciona parâmetros de busca específicos
            if (exactMatch) {
                params[searchType === 'autores' ? 'nome' : 'nome'] = text;
            } else {
                params.keyword = text;
                if (searchType === 'eventos') {
                    params.nome = text;
                }
            }

            const queryString = buildQueryString(params);
            const url = `${API_BASE_URL}${endpoint}?${queryString}`;
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            const result = await response.json();
            
            setData(result.data);
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
        } finally {
            setLoading(false);
        }
    };

    // Navegação para detalhes
    const navigateToDetails = (item) => {
        if (searchType === 'autores') {
            navigation.navigate('AutorDetails', { id: item._id });
        } else {
            navigation.navigate('EventoDetails', { 
                id: item._id,
                // Passa os dados necessários para a tela de detalhes
                evento: item
            });
        }
    };

    return (
        <View style={styles.container}>
            {/* Seletor de tipo de busca */}
            <SegmentedButtons
                value={searchType}
                onValueChange={setSearchType}
                buttons={[
                    { 
                        value: 'autores', 
                        label: 'Autores', 
                        buttonColor: '#e0e0e0',
                        textColor: '#000',
                    },
                    { 
                        value: 'eventos', 
                        label: 'Eventos', 
                        buttonColor: '#e0e0e0',
                        textColor: '#000',
                    },
                ]}
                style={{ marginBottom: 10 }}
            />

            {/* Campo de busca */}
            <TextInput
                label={`Buscar ${searchType === 'autores' ? 'Autor' : 'Evento'}`}
                value={searchText}
                onChangeText={handleAutocomplete}
                mode="outlined"
                style={{ marginBottom: 10 }}
            />

            {/* Sugestões de autocomplete */}
            {filteredData.length > 0 && (
                <FlatList
                    data={filteredData}
                    keyExtractor={(item) => item._id.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => onAutocompleteSelect(item)}>
                            <List.Item
                                title={item.nome}
                                description="Clique para selecionar"
                                left={props => <List.Icon {...props} icon={searchType === 'autores' ? 'account' : 'calendar'} />}
                            />
                        </TouchableOpacity>
                    )}
                    style={styles.autocompleteList}
                />
            )}

            {/* Botão de pesquisa */}
            <Button
                mode="contained"
                onPress={() => handleSearch(searchText)}
                buttonColor="#636363"
                style={{ marginTop: 10 }}
                loading={loading}
            >
                Pesquisar
            </Button>

            {/* Loader */}
            {loading && <ActivityIndicator animating={true} size="large" style={{ marginTop: 20 }} />}

            {/* Lista de resultados */}
            <FlatList
                data={data}
                keyExtractor={(item) => item._id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => navigateToDetails(item)}>
                        <List.Item
                            title={item.nome}
                            description={searchType === 'eventos' ? 
                                `${item.estado} - ${new Date(item.dataInicial).toLocaleDateString()}` : 
                                item.bio?.substring(0, 50) + '...'}
                            left={props => (
                                <List.Icon 
                                    {...props} 
                                    icon={searchType === 'autores' ? 'book' : 'calendar'} 
                                />
                            )}
                        />
                    </TouchableOpacity>
                )}
            />
   
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    autocompleteList: {
        backgroundColor: 'white',
        borderRadius: 8,
        elevation: 3,
        maxHeight: 150,
    },
});

export default Busca;