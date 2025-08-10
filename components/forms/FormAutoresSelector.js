import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Chip } from 'react-native-paper'; // Ou implementação customizada

const FormAutoresSelector = ({
    label,
    autores,
    autoresSelecionados,
    onToggleAutor,
    required = false,
    maxHeight = 200
}) => {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>
                {label}{required && '*'}
            </Text>

            <ScrollView
                style={[styles.scrollContainer, { maxHeight }]}
                nestedScrollEnabled
            >
                <View style={styles.chipContainer}>
                    {autores.map(autor => {
                        const isSelected = autoresSelecionados.includes(autor._id);
                        return (
                            <Chip
                                key={autor._id}
                                mode="outlined"
                                selected={isSelected}
                                onPress={() => onToggleAutor(autor._id)}
                                style={[
                                    styles.chip,
                                    isSelected && styles.chipSelected
                                ]}
                                textStyle={styles.chipText}
                            >
                                {autor.nome}
                            </Chip>
                        );
                    })}
                </View>
            </ScrollView>
        </View>
    );
};

// Alternativa sem react-native-paper
const CustomChip = ({ children, selected, onPress }) => (
    <TouchableOpacity
        style={[
            styles.customChip,
            selected && styles.customChipSelected
        ]}
        onPress={onPress}
    >
        <Text style={[
            styles.customChipText,
            selected && styles.customChipTextSelected
        ]}>
            {children}
        </Text>
    </TouchableOpacity>
);

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
    scrollContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        backgroundColor: '#f9f9f9',
        padding: 8,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    chip: {
        margin: 4,
        backgroundColor: '#f5f5f5',
    },
    chipSelected: {
        backgroundColor: '#d4e6f1',
        borderColor: '#3498db',
    },
    chipText: {
        fontSize: 14,
    },
    // Estilos para versão customizada
    customChip: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        margin: 4,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#f5f5f5',
    },
    customChipSelected: {
        backgroundColor: '#d4e6f1',
        borderColor: '#3498db',
    },
    customChipText: {
        fontSize: 14,
        color: '#333',
    },
    customChipTextSelected: {
        color: '#0366d6',
    },
});

//export default FormAutoresSelector;
export default React.memo(FormAutoresSelector);