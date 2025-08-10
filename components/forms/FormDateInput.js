// src/components/forms/FormDateInput.js

import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import CrossPlatformDatePicker from '../ui/CrossPlatformDatePicker';
import { formatarData } from '../../utils/dateUtils';

const FormDateInput = ({
    label,
    value,
    onChange,
    placeholder = "Selecione a data...",
    required = false,
    mode = 'date',
    maximumDate,
    minimumDate
}) => {
    const [showPicker, setShowPicker] = useState(false);
    const [internalDate, setInternalDate] = useState(value ? new Date(value) : null);

    const handleDateChange = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            setShowPicker(false);
        }

        if (selectedDate) {
            setInternalDate(selectedDate);
            // Garante que a data é enviada no formato YYYY-MM-DD
            const formattedDate = selectedDate.toISOString().split('T')[0];
            onChange(formattedDate);
        }
    };

      // Função para formatar o valor para exibição
    const displayValue = internalDate
        ? formatarData(internalDate.toISOString())
        : '';

    // Função para obter o valor no formato correto para o input web
    const getWebInputValue = () => {
        if (!value) return '';
        // Se já estiver no formato YYYY-MM-DD, usa diretamente
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
        // Caso contrário, converte
        return new Date(value).toISOString().split('T')[0];
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>
                {label}{required && '*'}
            </Text>

            {Platform.OS === 'web' ? (
                <CrossPlatformDatePicker
                    value={getWebInputValue()}
                    onChange={handleDateChange}
                    mode={mode}
                    maximumDate={maximumDate}
                    minimumDate={minimumDate}
                    style={styles.webInput}
                />
            ) : (
                <>
                    <View style={styles.inputContainer}>
                        <Text style={styles.input} onPress={() => setShowPicker(true)}>
                            {displayValue || placeholder}
                        </Text>
                    </View>

                    {showPicker && (
                        <CrossPlatformDatePicker
                            value={internalDate || new Date()}
                            onChange={handleDateChange}
                            mode={mode}
                            maximumDate={maximumDate}
                            minimumDate={minimumDate}
                        />
                    )}
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        fontWeight: 'bold',
        color: '#333'
    },
    inputContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        backgroundColor: '#f9f9f9',
        height: 50,
        justifyContent: 'center',
        paddingHorizontal: 10,
    },
    input: {
        fontSize: 16,
        color: '#333',
    },
    webInput: {
        width: '100%',
        height: 50,
        padding: 10,
    },
});

//export default FormDateInput;
export default React.memo(FormDateInput);


/*
import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import CrossPlatformDatePicker from '../ui/CrossPlatformDatePicker';
import { formatarData } from '../../utils/dateUtils';

const FormDateInput = ({
    label,
    value,
    onChange,
    placeholder = "Selecione a data...",
    required = false,
    mode = 'date',
    maximumDate,
    minimumDate
}) => {
    const [showPicker, setShowPicker] = useState(false);
    const [internalDate, setInternalDate] = useState(value ? new Date(value) : null);

    const handleDateChange = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            setShowPicker(false);
        }

        if (selectedDate) {
            setInternalDate(selectedDate);
            const formattedDate = selectedDate.toISOString().split('T')[0]; // Formato YYYY-MM-DD
            onChange(formattedDate);
        }
    };

    const displayValue = internalDate
        ? formatarData(internalDate.toISOString())
        : '';

    return (
        <View style={styles.container}>
            <Text style={styles.label}>
                {label}{required && '*'}
            </Text>

            {Platform.OS === 'web' ? (
                <CrossPlatformDatePicker
                    value={value}
                    onChange={(e) => handleDateChange(e, e.date)}
                    mode={mode}
                    maximumDate={maximumDate}
                    minimumDate={minimumDate}
                    style={styles.webInput}
                />
            ) : (
                <>
                    <View style={styles.inputContainer}>
                        <Text style={styles.input} onPress={() => setShowPicker(true)}>
                            {displayValue || placeholder}
                        </Text>
                    </View>

                    {showPicker && (
                        <CrossPlatformDatePicker
                            value={internalDate || new Date()}
                            onChange={handleDateChange}
                            mode={mode}
                            maximumDate={maximumDate}
                            minimumDate={minimumDate}
                        />
                    )}
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        fontWeight: 'bold',
        color: '#333'
    },
    inputContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        backgroundColor: '#f9f9f9',
        height: 50,
        justifyContent: 'center',
        paddingHorizontal: 10,
    },
    input: {
        fontSize: 16,
        color: '#333',
    },
    webInput: {
        width: '100%',
        height: 50,
        padding: 10,
    },
});

//export default FormDateInput;
export default React.memo(FormDateInput);

*/