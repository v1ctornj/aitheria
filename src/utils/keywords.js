import axios from 'axios';

const API_URL = 'https://api.example.com/keywords'; // Replace with actual API endpoint

export const extractKeywords = async (thematicSummary) => {
    try {
        const response = await axios.post(API_URL, { summary: thematicSummary });
        return response.data.keywords;
    } catch (error) {
        console.error('Error extracting keywords:', error);
        throw error;
    }
};

export const qualityCheckKeywords = (keywords) => {
    if (!Array.isArray(keywords)) {
        throw new Error('Keywords should be an array');
    }
    return keywords.filter(keyword => keyword.length > 2); // Example quality check
};