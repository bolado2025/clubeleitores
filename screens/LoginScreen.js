// LoginScreen.js
import React, { useState } from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../AuthContext';
import { useNavigation } from '@react-navigation/native'; // Adicionado
import showAlert from '../utils/alertUtils';


const LoginScreen = () => {
    const {
        signIn,
        authMode,
        setAuthMode,
        signUpWithEmail,
        loginWithEmail,
        requestPasswordReset
    } = useAuth();

    const endpoint = process.env.EXPO_PUBLIC_AMBIENTE === 'dev'
        ? process.env.EXPO_PUBLIC_API_URL_DEV
        : process.env.EXPO_PUBLIC_API_URL_PROD;

    const navigation = useNavigation(); // Adicionado para navegação

    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        senha: '',
        confirmarSenha: ''
    });

    // Removido o estado isRequestingReset e resetEmail

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        if (authMode === 'signup') {
            if (formData.senha !== formData.confirmarSenha) {
                showAlert('Erro', 'As senhas não coincidem');
                return;
            }
            signUpWithEmail(formData);
        } else {
            loginWithEmail({
                email: formData.email,
                senha: formData.senha
            });
        }
    };

    const navigateToResetPassword = async () => {
        if (!formData.email) {
            showAlert('Erro', 'Por favor, insira seu email');
            console.log('⚠️ Email não informado');
            return;
        }

        console.log('📤 Iniciando requisição para reset de senha...');
        console.log('➡️ Endpoint:', `${endpoint}/users/forgetPassword`);
        console.log('📧 Email enviado:', formData.email);

        try {
            const response = await fetch(`${endpoint}/users/forgetPassword`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email })
            });

            console.log('📨 Status da resposta:', response.status);

            const data = await response.json();
            console.log('📥 Resposta recebida:', data);

            if (!response.ok) {
                console.error('❌ Erro no Backend:', data.message || 'Erro desconhecido');
                throw new Error(data.message || 'Erro ao solicitar reset de senha');
            }

            showAlert('Sucesso', 'Email de redefinição enviado! Verifique sua caixa de entrada.');
            console.log('✅ Solicitação de reset enviada com sucesso.');

        } catch (error) {
            console.error('🔥 Erro na requisição:', error);
            showAlert('Erro', error.message);
        }
    };
    

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.loginContainer}>
                    <Image
                        source={require('../assets/animation/book.gif')}
                        style={styles.animationBackground}
                        resizeMode="cover"
                    />

                    <View style={styles.loginContent}>
                        <Image
                            source={require('../assets/images/booklogo.jpg')}
                            style={styles.logo}
                        />

                        <Text style={styles.title}>Administração AyoBooks</Text>
                        <Text style={styles.subtitle}>Web & Apps - Clube de Leitores</Text>

                        {/* Removido o bloco condicional isRequestingReset */}
                        <View style={styles.formContainer}>
                            <Text style={styles.formTitle}>
                                {authMode === 'signup' ? 'Criar Conta' : 'Acessar Conta'}
                            </Text>

                            {authMode === 'signup' && (
                                <TextInput
                                    style={styles.input}
                                    placeholder="Seu nome completo"
                                    value={formData.nome}
                                    onChangeText={(text) => handleChange('nome', text)}
                                />
                            )}

                            <TextInput
                                style={styles.input}
                                placeholder="Seu email"
                                value={formData.email}
                                onChangeText={(text) => handleChange('email', text)}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />

                            <TextInput
                                style={styles.input}
                                placeholder="Sua senha"
                                value={formData.senha}
                                onChangeText={(text) => handleChange('senha', text)}
                                secureTextEntry
                            />

                            {authMode === 'signup' && (
                                <TextInput
                                    style={styles.input}
                                    placeholder="Confirme sua senha"
                                    value={formData.confirmarSenha}
                                    onChangeText={(text) => handleChange('confirmarSenha', text)}
                                    secureTextEntry
                                />
                            )}

                            <TouchableOpacity
                                style={styles.button}
                                onPress={handleSubmit}
                            >
                                <Text style={styles.buttonText}>
                                    {authMode === 'signup' ? 'Cadastrar' : 'Entrar'}
                                </Text>
                            </TouchableOpacity>

                            {authMode === 'login' && (
                                <TouchableOpacity
                                    style={styles.linkButton}
                                    onPress={navigateToResetPassword} // Alterado para navegar para a nova tela
                                >
                                    <Text style={styles.linkText}>Esqueci minha senha</Text>
                                </TouchableOpacity>
                            )}

                            <View style={styles.divider}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>OU</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            <TouchableOpacity
                                style={styles.googleButton}
                                onPress={signIn}
                            >
                                <Image
                                    source={require('../assets/images/google-icon.png')}
                                    style={styles.googleIcon}
                                />
                                <Text style={styles.googleButtonText}>
                                    {authMode === 'signup' ? 'Cadastrar com Google' : 'Entrar com Google'}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.linkButton}
                                onPress={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                            >
                                <Text style={styles.linkText}>
                                    {authMode === 'login'
                                        ? 'Não tem uma conta? Cadastre-se'
                                        : 'Já tem uma conta? Faça login'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
    },
    loginContainer: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    animationBackground: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: 0.8,
    },
    loginContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'rgba(245, 245, 245, 0.8)',
    },
    logo: {
        width: 120,
        height: 120,
        marginBottom: 20,
        resizeMode: 'contain',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 5,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#7f8c8d',
        marginBottom: 30,
        textAlign: 'center',
    },
    formContainer: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    formTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        height: 50,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 15,
        marginBottom: 15,
        fontSize: 16,
    },
    button: {
        backgroundColor: '#3498db',
        paddingVertical: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 15,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryButton: {
        backgroundColor: '#95a5a6',
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    linkButton: {
        paddingVertical: 10,
        alignItems: 'center',
    },
    linkText: {
        color: '#3498db',
        fontSize: 14,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#ddd',
    },
    dividerText: {
        marginHorizontal: 10,
        color: '#7f8c8d',
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        marginBottom: 15,
    },
    googleIcon: {
        width: 24,
        height: 24,
        marginRight: 12,
    },
    googleButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#757575',
    },
});

export default LoginScreen;


// ... (mantenha os estilos existentes)


/*

// LoginScreen.js
import React, { useState } from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../AuthContext';
import showAlert from '../utils/alertUtils';

const LoginScreen = () => {
    const {
        signIn,
        authMode,
        setAuthMode,
        signUpWithEmail,
        loginWithEmail,
        requestPasswordReset
    } = useAuth();

    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        senha: '',
        confirmarSenha: ''
    });
    const [isRequestingReset, setIsRequestingReset] = useState(false);
    const [resetEmail, setResetEmail] = useState('');

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = () => {
        if (authMode === 'signup') {
            if (formData.senha !== formData.confirmarSenha) {
                showAlert('Erro', 'As senhas não coincidem');
                return;
            }
            signUpWithEmail(formData);
        } else {
            loginWithEmail({
                email: formData.email,
                senha: formData.senha
            });
        }
    };

    const handlePasswordReset = () => {
        if (!resetEmail) {
            showAlert('Erro', 'Por favor, informe seu email');
            return;
        }
        requestPasswordReset(resetEmail);
        setIsRequestingReset(false);
        showAlert('Sucesso', 'Se o email existir, você receberá instruções para resetar sua senha');
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.loginContainer}>
                    <Image
                        source={require('../assets/animation/book.gif')}
                        style={styles.animationBackground}
                        resizeMode="cover"
                    />

                    <View style={styles.loginContent}>
                        <Image
                            source={require('../assets/images/booklogo.jpg')}
                            style={styles.logo}
                        />

                        <Text style={styles.title}>Administração AyoBooks</Text>
                        <Text style={styles.subtitle}>Web & Apps - Clube de Leitores</Text>

                        {isRequestingReset ? (
                            <View style={styles.formContainer}>
                                <Text style={styles.formTitle}>Redefinir Senha</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Seu email cadastrado"
                                    value={resetEmail}
                                    onChangeText={setResetEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                                <View style={styles.buttonGroup}>
                                    <TouchableOpacity
                                        style={[styles.button, styles.secondaryButton]}
                                        onPress={() => setIsRequestingReset(false)}
                                    >
                                        <Text style={styles.buttonText}>Cancelar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.button}
                                        onPress={handlePasswordReset}
                                    >
                                        <Text style={styles.buttonText}>Enviar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.formContainer}>
                                <Text style={styles.formTitle}>
                                    {authMode === 'signup' ? 'Criar Conta' : 'Acessar Conta'}
                                </Text>

                                {authMode === 'signup' && (
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Seu nome completo"
                                        value={formData.nome}
                                        onChangeText={(text) => handleChange('nome', text)}
                                    />
                                )}

                                <TextInput
                                    style={styles.input}
                                    placeholder="Seu email"
                                    value={formData.email}
                                    onChangeText={(text) => handleChange('email', text)}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />

                                <TextInput
                                    style={styles.input}
                                    placeholder="Sua senha"
                                    value={formData.senha}
                                    onChangeText={(text) => handleChange('senha', text)}
                                    secureTextEntry
                                />

                                {authMode === 'signup' && (
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Confirme sua senha"
                                        value={formData.confirmarSenha}
                                        onChangeText={(text) => handleChange('confirmarSenha', text)}
                                        secureTextEntry
                                    />
                                )}

                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={handleSubmit}
                                >
                                    <Text style={styles.buttonText}>
                                        {authMode === 'signup' ? 'Cadastrar' : 'Entrar'}
                                    </Text>
                                </TouchableOpacity>

                                {authMode === 'login' && (
                                    <TouchableOpacity
                                        style={styles.linkButton}
                                        onPress={() => setIsRequestingReset(true)}
                                    >
                                        <Text style={styles.linkText}>Esqueci minha senha</Text>
                                    </TouchableOpacity>
                                )}

                                <View style={styles.divider}>
                                    <View style={styles.dividerLine} />
                                    <Text style={styles.dividerText}>OU</Text>
                                    <View style={styles.dividerLine} />
                                </View>

                                <TouchableOpacity
                                    style={styles.googleButton}
                                    onPress={signIn}
                                >
                                    <Image
                                        source={require('../assets/images/google-icon.png')}
                                        style={styles.googleIcon}
                                    />
                                    <Text style={styles.googleButtonText}>
                                        {authMode === 'signup' ? 'Cadastrar com Google' : 'Entrar com Google'}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.linkButton}
                                    onPress={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                                >
                                    <Text style={styles.linkText}>
                                        {authMode === 'login'
                                            ? 'Não tem uma conta? Cadastre-se'
                                            : 'Já tem uma conta? Faça login'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
    },
    loginContainer: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    animationBackground: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: 0.8,
    },
    loginContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'rgba(245, 245, 245, 0.8)',
    },
    logo: {
        width: 120,
        height: 120,
        marginBottom: 20,
        resizeMode: 'contain',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 5,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#7f8c8d',
        marginBottom: 30,
        textAlign: 'center',
    },
    formContainer: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    formTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        height: 50,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 15,
        marginBottom: 15,
        fontSize: 16,
    },
    button: {
        backgroundColor: '#3498db',
        paddingVertical: 15,
        borderRadius: 5,
        alignItems: 'center',
        marginBottom: 15,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryButton: {
        backgroundColor: '#95a5a6',
    },
    buttonGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    linkButton: {
        paddingVertical: 10,
        alignItems: 'center',
    },
    linkText: {
        color: '#3498db',
        fontSize: 14,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#ddd',
    },
    dividerText: {
        marginHorizontal: 10,
        color: '#7f8c8d',
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        marginBottom: 15,
    },
    googleIcon: {
        width: 24,
        height: 24,
        marginRight: 12,
    },
    googleButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#757575',
    },
});

export default LoginScreen;

*/