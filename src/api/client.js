import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export async function fetchJobs() {
    const response = await axios.get(`${API_BASE_URL}/jobs`);
    return response.data;
}

export async function fetchCenters() {
    const response = await axios.get(`${API_BASE_URL}/centers`);
    return response.data;
}

export async function fetchCenter(id) {
    const response = await axios.get(`${API_BASE_URL}/centers/${id}`);
    return response.data;
}

export async function createCenter(centerData) {
    const response = await axios.post(`${API_BASE_URL}/centers`, centerData);
    return response.data;
}

export async function updateCenter(id, centerData) {
    const response = await axios.patch(`${API_BASE_URL}/centers/${id}`, centerData);
    return response.data;
}

export async function deleteCenter(id) {
    const response = await axios.delete(`${API_BASE_URL}/centers/${id}`);
    return response.data;
}

export async function analyzeJobPosting(text) {
    try {
        const response = await axios.post(`${API_BASE_URL}/ai/analyze`, { text });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'AI 분석에 실패했습니다.');
    }
}
