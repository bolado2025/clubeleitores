import { API_URL } from '../apiService';
import showAlert from '../utils/alertUtils';

/*
export const fetchEvento = async (id) => {
    try {
        const response = await fetch(`${API_URL}/eventos/${id}`);
        if (!response.ok) throw new Error('Erro ao carregar evento');
        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar evento:', error);
        showAlert('Erro', 'Não foi possível carregar os dados do evento');
        throw error;
    }
};
*/

export const fetchEvento = async (id) => {
    try {
        const [eventoResponse, imagemResponse] = await Promise.all([
            fetch(`${API_URL}/eventos/${id}`),
            fetch(`${API_URL}/eventos/${id}/imagem`).catch(() => null) // Ignora erros na imagem
        ]);

        if (!eventoResponse.ok) throw new Error('Erro ao carregar evento');

        const eventoData = await eventoResponse.json();
        let imagemBinaria = null;

        if (imagemResponse && imagemResponse.ok) {
            const blob = await imagemResponse.blob();
            imagemBinaria = URL.createObjectURL(blob);
        }

        return {
            ...eventoData,
            imagemBinaria // Adiciona a URL da imagem ao objeto retornado
        };
    } catch (error) {
        console.error('Erro ao buscar evento:', error);
        showAlert('Erro', 'Não foi possível carregar os dados do evento');
        throw error;
    }
};

export const fetchEventoImagem = async (id) => {
    try {
        const response = await fetch(`${API_URL}/eventos/${id}/imagem`);
        if (!response.ok) throw new Error('Erro ao carregar imagem do evento');

        // Para imagens binárias, normalmente retornamos a URL ou dados da imagem
        const blob = await response.blob();
        return URL.createObjectURL(blob);
    } catch (error) {
        console.error('Erro ao buscar imagem do evento:', error);
        throw error;
    }
};

export const saveEvento = async (eventoData, id) => {
    const url = id ? `${API_URL}/eventos/${id}` : `${API_URL}/eventos`;
    const method = id ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventoData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao salvar evento');
        }

        return await response.json();
    } catch (error) {
        console.error('Erro ao salvar evento:', error);
        showAlert('Erro', error.message || 'Ocorreu um erro ao salvar o evento');
        throw error;
    }
};

export const uploadEventoWithImage = async (formData, id) => {
    const url = id ? `${API_URL}/eventos/${id}` : `${API_URL}/eventos`;
    const method = id ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method,
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao salvar evento com imagem');
        }

        return await response.json();
    } catch (error) {
        console.error('Erro ao salvar evento com imagem:', error);
        showAlert('Erro', error.message || 'Ocorreu um erro ao salvar o evento');
        throw error;
    }
};