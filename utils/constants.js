// src/utils/constants.js

/**
 * Lista de unidades federativas do Brasil (siglas)
 * @constant {Array<string>}
 */
export const estadosBrasil = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

/**
 * Tipos de eventos literários disponíveis
 * @constant {Array<string>}
 */
export const tiposEvento = [
    'Feira Literária',
    'Lançamento de Livro',
    'Palestra',
    'Workshop',
    'Seminário',
    'Outro'
];

/**
 * Tamanho máximo de imagem em KB
 * @constant {number}
 */
export const MAX_IMAGE_SIZE_KB = 200;

// Opcional: Exportar como objeto padrão também
export default {
    estadosBrasil,
    tiposEvento,
    MAX_IMAGE_SIZE_KB
  };