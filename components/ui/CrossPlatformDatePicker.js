import React from 'react';
import { Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const CrossPlatformDatePicker = ({
    value,
    onChange,
    mode = 'date',
    maximumDate,
    minimumDate,
    style
}) => {
    const handleWebDateChange = (e) => {
        // Verifica se o evento e o target existem
        if (e && e.target && e.target.value) {
            const date = new Date(e.target.value);
            // Chama onChange com um objeto consistente
            onChange({ type: 'set' }, date);
        }
    };

    if (Platform.OS === 'web') {
        return (
            <input
                type="date"
                value={value ? new Date(value).toISOString().split('T')[0] : ''}
                onChange={handleWebDateChange}
                style={style}
                max={maximumDate ? maximumDate.toISOString().split('T')[0] : undefined}
                min={minimumDate ? minimumDate.toISOString().split('T')[0] : undefined}
            />
        );
    }

    return (
        <DateTimePicker
            value={value ? new Date(value) : new Date()}
            mode={mode}
            display="default"
            onChange={onChange}
            maximumDate={maximumDate}
            minimumDate={minimumDate}
        />
    );
};

export default React.memo(CrossPlatformDatePicker);


/*
import React, { useState } from 'react';
import { Platform, View, Text, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const CrossPlatformDatePicker = ({
    value,
    onChange,
    mode = 'date',
    maximumDate,
    minimumDate,
    style
}) => {
    // Função para converter para string no formato YYYY-MM-DD
    const toDateString = (date) => {
        if (!date) return undefined;
        if (!(date instanceof Date)) return undefined;
        return date.toISOString().split('T')[0];
    };

    if (Platform.OS === 'web') {
        return (
            <input
                type="date"
                value={value ? toDateString(new Date(value)) : ''}
                onChange={(e) => {
                    if (e.target.value) {
                        const date = new Date(e.target.value);
                        onChange({}, date);
                    }
                }}
                style={style}
                max={toDateString(maximumDate)}
                min={toDateString(minimumDate)}
            />
        );
    }

    return (
        <DateTimePicker
            value={value ? new Date(value) : new Date()}
            mode={mode}
            display="default"
            onChange={onChange}
            maximumDate={maximumDate}
            minimumDate={minimumDate}
        />
    );
};

export default React.memo(CrossPlatformDatePicker);
*/






/*
import React, { useState } from 'react';
import { Platform, View, Text, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const CrossPlatformDatePicker = ({ value, onChange }) => {
    const [showPicker, setShowPicker] = useState(false);

    if (Platform.OS === 'web') {
        return (
            <input
                type="date"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{
                    height: 40,
                    border: '1px solid #ddd',
                    borderRadius: 4,
                    padding: 8,
                    backgroundColor: '#f9f9f9'
                }}
            />
        );
    }

    return (
        <View>
            <TouchableOpacity onPress={() => setShowPicker(true)}>
                <Text>{value || 'Selecione uma data'}</Text>
            </TouchableOpacity>

            {showPicker && (
                <DateTimePicker
                    value={value || new Date()}
                    mode="date"
                    onChange={(event, date) => {
                        setShowPicker(false);
                        if (date) onChange(date);
                    }}
                />
            )}
        </View>
    );
};

//export default CrossPlatformDatePicker;
export default React.memo(CrossPlatformDatePicker);

*/