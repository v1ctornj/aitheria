import axios from 'axios';

const TAVILY_API_URL = 'https://api.tavily.com'; // Replace with the actual Tavily API URL

export const fetchContextualInfo = async (query) => {
    try {
        const response = await axios.get(`${TAVILY_API_URL}/search`, {
            params: { q: query },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching contextual information from Tavily:', error);
        throw error;
    }
};

export const fetchArticleById = async (articleId) => {
    try {
        const response = await axios.get(`${TAVILY_API_URL}/articles/${articleId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching article by ID from Tavily:', error);
        throw error;
    }
};