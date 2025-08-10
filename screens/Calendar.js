import React, { useState, useEffect } from "react";
import { 
    StyleSheet, 
    Text, 
    View, 
    SafeAreaView, 
    ActivityIndicator, 
    FlatList,
    TouchableOpacity 
} from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { Calendar } from 'react-native-calendars';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const API_BASE_URL = 'https://hubleitoresapi.onrender.com/api/v1';
//const API_BASE_URL = 'http://10.0.2.2:5000/api/v1';

const Calendario = () => {
    const navigation = useNavigation();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Formata a data para o padrão YYYY-MM-DD
    const formatDateToAPI = (date) => {
        return format(date, 'yyyy-MM-dd');
    };

    const fetchEventsByDate = async (date) => {
        try {
            setLoading(true);
            console.log('[1] - Iniciando busca por eventos...');
            
            const formattedDate = formatDateToAPI(date);
            console.log('[2] - Data formatada:', formattedDate);
            
            const apiUrl = `${API_BASE_URL}/eventos/date?date=${formattedDate}`;
            console.log('[3] - URL completa da requisição:', apiUrl);
            
            console.log('[4] - Fazendo requisição para API...');
            const response = await fetch(apiUrl);
            
            console.log('[5] - Resposta recebida. Status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('[6] - Erro na resposta:', {
                    status: response.status,
                    statusText: response.statusText,
                    errorText: errorText
                });
                throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
            }
            
            console.log('[7] - Processando JSON da resposta...');
            const data = await response.json();
            console.log('[8] - Dados recebidos:', JSON.stringify(data, null, 2));
            
            if (!data.data) {
                console.warn('[9] - A propriedade "data" não foi encontrada na resposta');
            }
            
            setEvents(data.data || []);
            console.log('[10] - Eventos atualizados com sucesso');
            
        } catch (error) {
            console.error('[11] - Erro no bloco catch:', {
                errorMessage: error.message,
                errorStack: error.stack,
                errorObject: JSON.stringify(error, Object.getOwnPropertyNames(error))
            });
            setEvents([]);
        } finally {
            console.log('[12] - Finalizando processo de carregamento');
            setLoading(false);
        }
    };

    // Carrega eventos do dia atual ao iniciar
    useEffect(() => {
        fetchEventsByDate(selectedDate);
    }, []);

    // Manipulador de seleção de data no calendário
    const handleDayPress = (day) => {
        const newDate = new Date(day.dateString);
        setSelectedDate(newDate);
        fetchEventsByDate(newDate);
    };

    // Navega para os detalhes do evento 
    const navigateToEventDetails = (event) => {
        console.log('ID do evento:', event._id);
        console.log('Evento completo:', event);

        navigation.navigate('EventoDetails', { 
            id: event._id,
            evento: event
        });
    };

    // Renderiza cada item da lista de eventos
    const renderEventItem = ({ item }) => (
        <TouchableOpacity 
            style={styles.eventItem}
            onPress={() => navigateToEventDetails(item)}
        >
            <Text style={styles.eventTitle}>{item.nome}</Text>
            <Text style={styles.eventInfo}>
                {item.estado} - {format(parseISO(item.dataInicial), 'dd/MM/yyyy', { locale: ptBR })}
                {item.dataFinal && ` a ${format(parseISO(item.dataFinal), 'dd/MM/yyyy', { locale: ptBR })}`}
            </Text>
            {item.listaAutores?.length > 0 && (
                <Text style={styles.eventAuthors}>
                    Autores: {item.listaAutores.map(a => a.nome).join(', ')}
                </Text>
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Calendário de Eventos</Text>
            </View>

            <Calendar
                onDayPress={handleDayPress}
                markedDates={{
                    [formatDateToAPI(selectedDate)]: { selected: true, selectedColor: '#6200ee' }
                }}
                theme={{
                    selectedDayBackgroundColor: '#6200ee',
                    todayTextColor: '#6200ee',
                    arrowColor: '#6200ee',
                }}
                style={styles.calendar}
                locale="pt"
            />

            <View style={styles.eventListContainer}>
                <Text style={styles.sectionTitle}>
                    Eventos em {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </Text>
                
                {loading ? (
                    <ActivityIndicator size="large" color="#6200ee" />
                ) : events.length > 0 ? (
                    <FlatList
                        data={events}
                        renderItem={renderEventItem}
                        keyExtractor={item => item._id}
                        contentContainerStyle={styles.eventList}
                    />
                ) : (
                    <Text style={styles.noEventsText}>Nenhum evento programado para esta data.</Text>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        padding: 20,
        backgroundColor: '#6200ee',
        alignItems: 'center',
    },
    headerText: {
        fontSize: 20,
        color: '#fff',
        fontWeight: 'bold',
    },
    calendar: {
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 10,
        margin: 10,
        overflow: 'hidden',
    },
    eventListContainer: {
        flex: 1,
        padding: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        paddingHorizontal: 10,
        color: '#333',
    },
    eventList: {
        paddingBottom: 20,
    },
    eventItem: {
        backgroundColor: '#f8f8f8',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        borderLeftWidth: 4,
        borderLeftColor: '#6200ee',
    },
    eventTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    eventInfo: {
        fontSize: 14,
        color: '#555',
        marginBottom: 3,
    },
    eventAuthors: {
        fontSize: 13,
        color: '#777',
        fontStyle: 'italic',
    },
    noEventsText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#888',
    },
});

export default Calendario;