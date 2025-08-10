import React from 'react';
import { View, Text, Picker, StyleSheet, Platform } from 'react-native';

const FormPicker = ({
    label,
    selectedValue,
    onValueChange,
    items,
    placeholder = "Selecione...",
    required = false,
    style
}) => {
    return (
        <View style={[styles.container, style]}>
            <Text style={styles.label}>
                {label}{required && '*'}
            </Text>
            <View style={styles.pickerContainer}>
                <Picker
                    selectedValue={selectedValue}
                    onValueChange={onValueChange}
                    style={styles.picker}
                    mode="dropdown"
                >
                    <Picker.Item label={placeholder} value="" />
                    {items.map((item, index) => (
                        <Picker.Item
                            key={index}
                            label={item}
                            value={typeof item === 'object' ? item.value : item}
                        />
                    ))}
                </Picker>
            </View>
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
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        backgroundColor: '#f9f9f9',
        ...Platform.select({
            ios: {
                height: 100,
            },
            android: {
                height: 50,
            },
        }),
    },
    picker: {
        height: '100%',
    },
});

//export default FormPicker;
export default React.memo(FormPicker);
