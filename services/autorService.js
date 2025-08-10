import { API_URL } from '../apiService';
import showAlert from '../utils/alertUtils';

/**
 * Serviço para manipulação de autores
 * @module autorService
 */

/**
 * Busca todos os autores cadastrados
 * @returns {Promise<Array>} Lista de autores
 * @throws {Error} Em caso de falha na requisição
 */
export const fetchAutores = async () => {
    try {
        const response = await fetch(`${API_URL}/autores`);

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar autores:', error);
        showAlert('Erro', 'Não foi possível carregar a lista de autores');
        throw error;
    }
};

/**
 * Busca um autor específico pelo ID
 * @param {string} id - ID do autor
 * @returns {Promise<Object>} Dados do autor
 */
export const fetchAutorById = async (id) => {
    try {
        const response = await fetch(`${API_URL}/autores/${id}`);

        if (!response.ok) {
            throw new Error(`Erro ao buscar autor: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Erro ao buscar autor ${id}:`, error);
        showAlert('Erro', 'Não foi possível carregar os dados do autor');
        throw error;
    }
};

/**
 * Cria um novo autor
 * @param {Object} autorData - Dados do autor a ser criado
 * @returns {Promise<Object>} Autor criado
 */
export const createAutor = async (autorData) => {
    try {
        const response = await fetch(`${API_URL}/autores`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(autorData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao criar autor');
        }

        return await response.json();
    } catch (error) {
        console.error('Erro ao criar autor:', error);
        showAlert('Erro', error.message || 'Não foi possível criar o autor');
        throw error;
    }
};

/**
 * Atualiza um autor existente
 * @param {string} id - ID do autor a ser atualizado
 * @param {Object} autorData - Dados atualizados do autor
 * @returns {Promise<Object>} Autor atualizado
 */
export const updateAutor = async (id, autorData) => {
    try {
        const response = await fetch(`${API_URL}/autores/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(autorData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao atualizar autor');
        }

        return await response.json();
    } catch (error) {
        console.error(`Erro ao atualizar autor ${id}:`, error);
        showAlert('Erro', error.message || 'Não foi possível atualizar o autor');
        throw error;
    }
};

/**
 * Remove um autor
 * @param {string} id - ID do autor a ser removido
 * @returns {Promise<Object>} Resposta da API
 */
export const deleteAutor = async (id) => {
    try {
        const response = await fetch(`${API_URL}/autores/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao remover autor');
        }

        return await response.json();
    } catch (error) {
        console.error(`Erro ao remover autor ${id}:`, error);
        showAlert('Erro', error.message || 'Não foi possível remover o autor');
        throw error;
    }
};

/**
 * Busca autores que correspondem a um termo de pesquisa
 * @param {string} searchTerm - Termo para busca
 * @returns {Promise<Array>} Lista de autores encontrados
 */
export const searchAutores = async (searchTerm) => {
    try {
        const response = await fetch(`${API_URL}/autores/search?q=${encodeURIComponent(searchTerm)}`);

        if (!response.ok) {
            throw new Error(`Erro na busca: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar autores:', error);
        showAlert('Erro', 'Não foi possível realizar a busca');
        throw error;
    }
};

export default {
    fetchAutores,
    fetchAutorById,
    createAutor,
    updateAutor,
    deleteAutor,
    searchAutores
};