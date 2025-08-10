import React, { useState, useCallback , useEffect } from 'react';
import { 
  View, 
  Text, 
  Button, 
  Image, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  FlatList,
  ActivityIndicator
} from 'react-native';
import { useAuth } from '../AuthContext';
import { useFocusEffect } from '@react-navigation/native';

const ProfileScreen = ({ navigation }) => {
  const { userInfo, signOut, syncWithBackendnoDelay, isFirstAttempt } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('autores'); // 'autores' ou 'eventos'
  const [error, setError] = useState(null);
  const [localUserData, setLocalUserData] = useState(null);


  useFocusEffect(
    useCallback(() => {

    //  useEffect(() => {
        
        console.log ('entrou em useEffect no ProfileScren'); 

        const fetchUserData = async () => {
          //if (!userInfo?._id) {
            //setLoading(false);
            //return;
          //}

          try {

              console.log('Iniciando carregamento dos dados do usuário...');
              setLoading(true);

              // Verificação completa de userInfo
              if (!userInfo) {
                console.error('userInfo está undefined ou null!');
                throw new Error('Dados do usuário não disponíveis (userInfo ausente)');
              }

              console.log('userInfo está definido. Atributos disponíveis:');
              Object.entries(userInfo).forEach(([key, value]) => {
                console.log(` - ${key}:`, value);
              });
            
              //console.log('ID do usuário obtido de userInfo:', userInfo?._id);
            
              const encodedEmail = encodeURIComponent(userInfo.email); // Garante compatibilidade com caracteres especiais como @ e .
              const endpoint = `https://hubleitoresapi.onrender.com/api/v1/users/by-email/${encodedEmail}`;
              console.log('URL da requisição:', endpoint);

              const response = await fetch(endpoint);
            
              console.log('Status da resposta:', response.status);
            
              if (!response.ok) {
                console.error('Erro na resposta do servidor:', response.status, response.statusText);
                throw new Error('Falha ao carregar dados do usuário');
              }
            
              const userData = await response.json();
              console.log('Dados do usuário recebidos com sucesso:', userData);
            
              // Atualiza tanto o contexto quanto o estado local
              //syncWithBackendnoDelay(userData);
              console.log('Atualizando estado local com os dados recebidos...');
              setLocalUserData(userData);
              console.log('Atualização concluída.');

            /*setLoading(true);
              //isFirstAttempt(true);
              console.log('Fetching user data for ID:', userInfo._id); // Debug
              
              const response = await fetch(
                `https://hubleitoresapi.onrender.com/api/v1/users/${userInfo._id}`
              );
              
              if (!response.ok) {
                throw new Error('Falha ao carregar dados do usuário');
              }
              
              const userData = await response.json();
              console.log('User data received:', userData); // Debug
              
              // Atualiza tanto o contexto quanto o estado local
              //syncWithBackendnoDelay(userData);
              setLocalUserData(userData);
            */
          } catch (err) {
            console.error('Erro ao buscar dados do usuário:', err);
            setError(err.message);
          } finally {
            setLoading(false);
            isFirstAttempt(false);
          }
        };

      fetchUserData();

      // Só faz a chamada se não tiver os dados completos ainda
      //if (userInfo && (!userInfo.autoresFavoritos || !userInfo.eventosFavoritos)) {
      //  fetchUserData();
      //} else {
      //  setLoading(false);
      //}
    }, [userInfo?._id])

  );

  if (!userInfo) {
    return null;
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Carregando seus dados...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => setError(null)}
        >
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }


  // Função para navegar para detalhes do autor
  const navigateToAuthor = (author) => {
    navigation.navigate('AutorDetails', { 
      id: author._id,
      autor: author 
    });
  };

  // Função para navegar para detalhes do evento
  const navigateToEvent = (event) => {
    navigation.navigate('EventoDetails', { 
      id: event._id,
      evento: event 
    });
  };

  // Renderiza cada item da lista de autores
  const renderAuthorItem = ({ item }) => (
    <TouchableOpacity 
      key={item._id} // Adicionado key aqui também como redundância
      style={styles.itemContainer}
      onPress={() => navigateToAuthor(item)}
    >
      <Image 
        source={{ uri: item.image }} 
        style={styles.itemImage} 
      />
      <View style={styles.itemTextContainer}>
        <Text style={styles.itemTitle}>{item.nome}</Text>
        <Text 
          style={styles.itemDescription} 
          numberOfLines={2}
        >
          {item.bio || item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Renderiza cada item da lista de eventos
  const renderEventItem = ({ item }) => (
    <TouchableOpacity 
      key={item._id} // Adicionado key aqui também como redundância
      style={styles.itemContainer}
      onPress={() => navigateToEvent(item)}
    >
      {item.imagem && (
        <Image 
          source={{ uri: item.imagem }} 
          style={styles.itemImage} 
        />
      )}
      <View style={styles.itemTextContainer}>
        <Text style={styles.itemTitle}>{item.nome}</Text>
        <Text style={styles.itemSubtitle}>
          {new Date(item.dataInicial).toLocaleDateString()} - {item.estado}
        </Text>
        <Text style={styles.itemType}>{item.tipoEvento}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>

        <View style={styles.profileHeader}>
          {userInfo.profileImage?.data ? (
            <Image 
              source={{ uri: `data:${userInfo.profileImage.contentType};base64,${userInfo.profileImage.data.toString('base64')}` }} 
              style={styles.avatar} 
            />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarText}>
              {(userInfo?.authType === 'google'
                ? userInfo?.name?.charAt(0)
                : userInfo?.nome?.charAt(0) || '?'
              ).toUpperCase()}
            </Text>
          </View>
        )}
      
        <Text style={styles.name}>
          {userInfo?.authType === 'google' ? userInfo?.name : userInfo?.nome}
        </Text>
        <Text style={styles.email}>{userInfo.email}</Text>


          <TouchableOpacity 
            style={styles.elegantLogoutButton}
            onPress={signOut}
          >
            <Text style={styles.elegantLogoutText}>Sair da conta</Text>
          </TouchableOpacity>
        
      <View style={styles.statsContainer}>


        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {localUserData?.autoresFavoritos?.length || 0}
          </Text>
          <Text style={styles.statLabel}>Autores</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {localUserData?.eventosFavoritos?.length || 0}
          </Text>
          <Text style={styles.statLabel}>Eventos</Text>
        </View>

      </View>

      </View>

      <View style={styles.navContainer}>
        <TouchableOpacity 
          style={[
            styles.navButton, 
            activeTab === 'autores' && styles.navButtonActive
          ]}
          onPress={() => setActiveTab('autores')}
        >
          <Text style={[
            styles.navButtonText,
            activeTab === 'autores' && styles.navButtonTextActive
          ]}>
            Autores Favoritos
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.navButton, 
            activeTab === 'eventos' && styles.navButtonActive
          ]}
          onPress={() => setActiveTab('eventos')}
        >
          <Text style={[
            styles.navButtonText,
            activeTab === 'eventos' && styles.navButtonTextActive
          ]}>
            Eventos Favoritos
          </Text>
        </TouchableOpacity>
      </View>


      {activeTab === 'autores' ? (
        <FlatList
          data={localUserData?.autoresFavoritos || []}
          renderItem={renderAuthorItem}
          keyExtractor={item => item._id}
          scrollEnabled={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Nenhum autor favorito encontrado
            </Text>
          }
        />
      ) : (
        <FlatList
          data={localUserData?.eventosFavoritos || []}
          renderItem={renderEventItem}
          keyExtractor={item => item._id}
          scrollEnabled={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Nenhum evento favorito encontrado
            </Text>
          }
        />
      )}

      
      <View style={styles.futureFeatures}>
        <Text style={styles.sectionTitle}>Minhas Vantagens</Text>
        
        <TouchableOpacity 
          style={styles.featureButton}
          onPress={() => navigation.navigate('Descontos')}
        >
          <Text style={styles.featureButtonText}>Descontos Exclusivos</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.featureButton}
          onPress={() => navigation.navigate('Promocoes')}
        >
          <Text style={styles.featureButtonText}>Promoções</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.featureButton}
          onPress={() => navigation.navigate('Vouchers')}
        >
          <Text style={styles.featureButtonText}>Meus Vouchers</Text>
        </TouchableOpacity>
      </View>


    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 48,
    color: 'white',
    fontWeight: 'bold',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#2c3e50',
  },
  email: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  navContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  navButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  navButtonActive: {
    borderBottomColor: '#3498db',
  },
  navButtonText: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  navButtonTextActive: {
    color: '#3498db',
    fontWeight: 'bold',
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  itemTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#2c3e50',
  },
  itemDescription: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#3498db',
    marginBottom: 4,
  },
  itemType: {
    fontSize: 12,
    color: '#95a5a6',
    fontStyle: 'italic',
  },
  emptyText: {
    textAlign: 'center',
    color: '#95a5a6',
    marginVertical: 20,
  },
  futureFeatures: {
    marginTop: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  featureButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  featureButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutContainer: {
    marginBottom: 80, // Espaço extra para evitar sobreposição com o BottomTab
    paddingHorizontal: 20, // Padding lateral para melhor aparência
    marginTop: 20, // Espaço acima do botão
  },
  elegantLogoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#e74c3c',
    borderRadius: 15,
    backgroundColor: 'transparent',
  },
});

export default ProfileScreen;


/*


import React from 'react';
import { View, Text, Button, Image, StyleSheet } from 'react-native';
import { useAuth } from '../AuthContext';

const ProfileScreen = () => {
  const { userInfo, signOut } = useAuth();

  if (!userInfo) {
    return null; // Segurança extra, embora o BottomTab já proteja
  }

  return (
    <View style={styles.container}>
      {userInfo.picture && (
        <Image source={{ uri: userInfo.picture }} style={styles.avatar} />
      )}
      <Text style={styles.name}>{userInfo.name}</Text>
      <Text style={styles.email}>{userInfo.email}</Text>
      <Button title="Sair da Conta" onPress={signOut} color="#e74c3c" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 20,
  },
});

export default ProfileScreen;

*/



