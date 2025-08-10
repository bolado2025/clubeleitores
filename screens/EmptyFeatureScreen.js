import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const EmptyFeatureScreen = ({ route }) => {
  const { featureName } = route.params;
  
  const getMessage = () => {
    switch(featureName) {
      case 'Descontos':
        return 'Você não tem descontos exclusivos ativos no momento.';
      case 'Promocoes':
        return 'Nenhuma promoção disponível no momento.';
      case 'Vouchers':
        return 'Você não possui vouchers ativos.';
      default:
        return 'Recurso não disponível no momento.';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{featureName}</Text>
      <Text style={styles.message}>{getMessage()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
});

export default EmptyFeatureScreen;