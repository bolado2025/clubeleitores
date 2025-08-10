import React, { useEffect, useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../AuthContext';
import showAlert from '../utils/alertUtils';
import axios from 'axios';

const AutoresFavoritos = ({ navigation }) => {
  const { userInfo, syncWithBackendnoDelay } = useAuth();
  const [autores, setAutores] = useState([]);

  const autorPadrao = {
    id: '682123a65694159d3d4c25b6',
    nome: process.env.EXPO_PUBLIC_AUTOR_PADRAO_NOME || 'Autor Padrão',
    image: process.env.EXPO_PUBLIC_AUTOR_PADRAO_IMG || 'https://via.placeholder.com/100',
  };

  //useEffect(() => {

  useFocusEffect(
    useCallback(() => {  
    const fetchAutoresFavoritos = async () => {
      try {
        console.log('🔍 Iniciando fetchAutoresFavoritos...');
        
        //if (userInfo?.token) {
        //  console.log('✅ Token encontrado:', userInfo.token);
  
        //  const userResponse = await axios.get('https://hubleitoresapi.onrender.com/api/v1/users', {
        //    headers: { Authorization: `Bearer ${userInfo.token}` }
        //  });

        if (userInfo) {

          console.log('✅ Usuário logado encontrado:', userInfo);
           
          const userResponse = await axios.get('https://hubleitoresapi.onrender.com/api/v1/users');
  
          console.log('📦 Resposta do endpoint /users:', userResponse.data);
  
          const currentUser = userResponse.data?.data?.find(u => u.email === userInfo.email);
          console.log('👤 Usuário autenticado localizado:', currentUser);
  
          if (currentUser?.autoresFavoritos?.length > 0) {
            console.log(`⭐ ${currentUser.autoresFavoritos.length} autores favoritos encontrados.`);
  
            const favoritos = currentUser.autoresFavoritos.map((autor, index) => {
              console.log(`🔄 Processando autor #${index + 1}:`, autor);
  
              let imageUrl = '';
  
              if (autor.image) {
                console.log('🖼️ Usando image (link externo):', autor.image);
                imageUrl = autor.image;
              } else if (autor.imageData?.data && autor.imageData?.contentType) {
                console.log('🧬 Convertendo imageData para base64');
                const base64 = Buffer.from(autor.imageData.data).toString('base64');
                imageUrl = `data:${autor.imageData.contentType};base64,${base64}`;
              } else {
                console.warn('⚠️ Nenhuma imagem disponível para autor:', autor.nome);
              }
  
              return {
                id: autor._id,
                nome: autor.nome,
                image: imageUrl,
              };
            });
  
            console.log('✅ Lista final de favoritos formatada:', favoritos);
            setAutores(favoritos);
          } else {
            console.log('📭 Nenhum autor favorito encontrado para este usuário.');
            setAutores([autorPadrao]);
          }
        
        
        /*const user = await getLocalUser();
        
        if (user?.localData?.backendUserId == null) {
            console.log("[initializeAuth] BackendUserId não encontrado. Iniciando sincronização...");
            await syncWithBackendnoDelay(user); // Adicionei 'await' para garantir conclusão
            console.log("[initializeAuth] Sincronização com backend concluída!");
        } else {
            console.log("[initializeAuth] Usuário já possui backendUserId. Nenhuma sincronização necessária.");
        } */ 


        } else {
          console.log('🔒 Usuário não logado. Exibindo autor padrão.');
          setAutores([autorPadrao]);
        }
      } catch (error) {
        console.error('❌ Erro ao buscar autores favoritos:', error);
        setAutores([autorPadrao]);
      }
    };
  
    fetchAutoresFavoritos();
  //}, [userInfo]);
    }, [userInfo])
  );

  const getLocalUser = async () => {
    const data = await AsyncStorage.getItem('@user');
    return data ? JSON.parse(data) : null;
  };  
  

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => {
        if (!userInfo) {
          showAlert("Dica", "Você precisa estar logado para saber mais sobre um autor.");
          return;
        }
        navigation.navigate('AutorDetails', { id: item._id || item.id, nome: item.nome, image: item.image });
      }}
      style={styles.itemContainer}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.image} />
      </View>

    </TouchableOpacity>
  );

  return (
    <View style={{ paddingVertical: 10 }}>
      <FlatList
        data={autores}
        renderItem={renderItem}
        keyExtractor={(item) => item._id?.toString() || item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#2980b9',
    marginBottom: 5,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  description: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default AutoresFavoritos;
