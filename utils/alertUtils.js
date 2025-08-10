// src/utils/alertUtils.js
import { Platform, Alert } from 'react-native';

/**
 * Exibe um alerta multiplataforma (iOS, Android e Web)
 * @param {string} title - Título do alerta
 * @param {string} message - Mensagem do alerta
 * @param {Array} [buttons] - Array de botões (opcional)
 * @returns {void}
 */
const showAlert = (title, message, buttons) => {
    // Caso para web
    if (Platform.OS === 'web') {
        if (buttons && buttons.length > 0) {
            // Alerta de confirmação para web
            const result = window.confirm(`${title}\n\n${message}\n\nPressione OK para confirmar ou Cancelar para voltar.`);

            // Encontra o botão de confirmação (aquele que não é 'cancel')
            const confirmButton = buttons.find(btn => btn.style !== 'cancel');

            if (result && confirmButton?.onPress) {
                confirmButton.onPress();
            }
        } else {
            // Alerta simples para web
            window.alert(`${title}\n\n${message}`);
        }
    }
    // Caso para mobile (iOS/Android)
    else {
        if (buttons) {
            Alert.alert(title, message, buttons);
        } else {
            Alert.alert(title, message);
        }
    }
};

export default showAlert;