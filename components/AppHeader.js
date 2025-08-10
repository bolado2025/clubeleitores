import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const AppHeader = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.header}>
      <Text style={styles.title}>📚 Meu App Literário</Text>
      
      <View style={styles.buttons}>
        <TouchableOpacity onPress={() => navigation.navigate('EndPoints')}>
          <Text style={styles.link}>Endpoints</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('UserList')}>
          <Text style={styles.link}>Usuários</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#3498db',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  buttons: {
    flexDirection: 'row',
    marginTop: 5,
  },
  link: {
    color: '#fff',
    marginRight: 15,
    fontSize: 16,
  },
});

export default AppHeader;
