import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const CrossPlatformChip = ({ selected, onPress, children }) => {
    return (
        <TouchableOpacity
            style={[
                styles.chip,
                selected && styles.selectedChip
            ]}
            onPress={onPress}
        >
            <Text style={[
                styles.text,
                selected && styles.selectedText
            ]}>
                {children}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    chip: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        margin: 4,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#f5f5f5',
    },
    selectedChip: {
        backgroundColor: '#d4e6f1',
        borderColor: '#3498db',
    },
    text: {
        fontSize: 14,
        color: '#333',
    },
    selectedText: {
        color: '#0366d6',
    },
});

export default React.memo(CrossPlatformChip);