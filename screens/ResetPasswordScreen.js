// ResetPasswordScreen.js
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
//import { useSearchParams } from 'expo-router'; // Para Expo Router v2


const ResetPasswordScreen = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const route = useRoute();
    const navigation = useNavigation();
    const { token } = route.params;

    //const [searchParams] = useSearchParams();
    //const token = searchParams.token; // Extrai o token da URL (ex: /reset-password?token=123)


    const endpoint = process.env.EXPO_PUBLIC_AMBIENTE === 'dev'
        ? process.env.EXPO_PUBLIC_API_URL_DEV
        : process.env.EXPO_PUBLIC_API_URL_PROD;

    const handleResetPassword = async () => {
        if (newPassword !== confirmPassword) {
            alert('As senhas não coincidem!');
            return;
        }

        setLoading(true);
        try {
            console.log('token - ', token );

            const response = await fetch(`${endpoint}/users/resetPassword/${token}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ senha: newPassword })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro ao redefinir senha');
            }

            alert('Senha redefinida com sucesso!');
            navigation.navigate('Login');
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Redefinir Senha</Text>
            <TextInput
                style={styles.input}
                placeholder="Nova Senha"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
            />
            <TextInput
                style={styles.input}
                placeholder="Confirmar Nova Senha"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
            />
            <Button
                title={loading ? "Processando..." : "Redefinir Senha"}
                onPress={handleResetPassword}
                disabled={loading}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        textAlign: 'center'
    },
    input: {
        height: 50,
        borderColor: '#ddd',
        borderWidth: 1,
        marginBottom: 15,
        padding: 15,
        borderRadius: 5
    }
});

export default ResetPasswordScreen;