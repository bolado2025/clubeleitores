/**
 * Biblioteca de utilitários para manipulação de datas
 * @module dateUtils
 */

/**
 * Formata uma data ISO (YYYY-MM-DDTHH:mm:ss.sssZ) para o padrão brasileiro (dd/mm/yyyy)
 * @param {string} dataString - Data no formato ISO
 * @returns {string} Data formatada no padrão pt-BR
 * @example
 * formatarData('2023-07-15T00:00:00.000Z') // Retorna '15/07/2023'
 */

export const formatarData = (dataString) => {
    if (!dataString) return '';

    try {
        const data = new Date(dataString);

        if (isNaN(data.getTime())) {
            console.error('Data inválida:', dataString);
            return '';
        }

        const dia = String(data.getUTCDate()).padStart(2, '0');
        const mes = String(data.getUTCMonth() + 1).padStart(2, '0'); // mês começa do zero
        const ano = data.getUTCFullYear();

        return `${dia}/${mes}/${ano}`;
    } catch (error) {
        console.error('Erro ao formatar data:', error);
        return '';
    }
};

export const formatarData_v2 = (dataString) => {
    if (!dataString) return '';

    try {
        const data = new Date(dataString);

        // Verifica se a data é válida
        if (isNaN(data.getTime())) {
            console.error('Data inválida:', dataString);
            return '';
        }

        return data.toLocaleDateString('pt-BR');
    } catch (error) {
        console.error('Erro ao formatar data:', error);
        return '';
    }
};

/**
 * Calcula a diferença em dias entre uma data no formato pt-BR e a data atual
 * @param {string} dataPtBR - Data no formato dd/mm/yyyy
 * @returns {number} Diferença em dias (positivo para datas futuras, negativo para passadas)
 * @example
 * calcularDiferencaDias('15/07/2023') // Retorna 0 se for hoje
 */
export const calcularDiferencaDias = (dataPtBR) => {
    if (!dataPtBR) return null;

    try {
        // Valida o formato da string
        if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dataPtBR)) {
            throw new Error('Formato de data inválido. Use dd/mm/yyyy');
        }

        const [dia, mes, ano] = dataPtBR.split('/').map(Number);

        // Validação básica dos valores
        if (dia < 1 || dia > 31 || mes < 1 || mes > 12 || ano < 1000) {
            throw new Error('Valores de data inválidos');
        }

        const dataInformada = new Date(ano, mes - 1, dia);

        // Verifica se a data é válida
        if (isNaN(dataInformada.getTime())) {
            throw new Error('Data inválida');
        }

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const diffMs = dataInformada - hoje;
        const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        return diffDias;
    } catch (error) {
        console.error('Erro ao calcular diferença de dias:', error.message);
        return null;
    }
};

/**
 * Combinação das funções: converte de ISO para pt-BR e calcula a diferença de dias
 * @param {string} dataISO - Data no formato ISO
 * @returns {Object} { dataFormatada: string, diferencaDias: number }
 * @example
 * converterECalcularDias('2023-07-15T00:00:00.000Z') 
 * // Retorna { dataFormatada: '15/07/2023', diferencaDias: 0 }
 */
export const converterECalcularDias = (dataISO) => {
    const dataFormatada = formatarData(dataISO);
    const diferencaDias = calcularDiferencaDias(dataFormatada);

    return {
        dataFormatada,
        diferencaDias
    };
};

/**
 * Formata a diferença de dias em uma string humanizada
 * @param {number} dias - Diferença em dias
 * @returns {string} Mensagem formatada
 * @example
 * humanizarDiferencaDias(5) // Retorna 'Em 5 dias'
 */
export const humanizarDiferencaDias = (dias) => {
    if (dias === 0) return 'Hoje';
    if (dias === 1) return 'Amanhã';
    if (dias === -1) return 'Ontem';
    if (dias > 0) return `Em ${dias} dias`;
    return `Há ${Math.abs(dias)} dias`;
};

export default {
    formatarData,
    calcularDiferencaDias,
    converterECalcularDias,
    humanizarDiferencaDias
  };