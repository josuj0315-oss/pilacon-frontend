export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export async function fetchJobs() {
    const response = await fetch(`${API_BASE_URL}/jobs`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
}
// Centers API
export async function fetchCenters() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/centers`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('401 Unauthorized: Failed to fetch centers');
        }
        throw new Error('Failed to fetch centers');
    }
    return response.json();
}

export async function fetchCenter(id) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/centers/${id}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) throw new Error('Failed to fetch center');
    return response.json();
}

export async function createCenter(centerData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/centers`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(centerData)
    });
    if (!response.ok) throw new Error('Failed to create center');
    return response.json();
}

export async function updateCenter(id, centerData) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/centers/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(centerData)
    });
    if (!response.ok) throw new Error('Failed to update center');
    return response.json();
}

export async function deleteCenter(id) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/centers/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) throw new Error('Failed to delete center');
    return response.json();
}

export async function analyzeJobPosting(text) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/ai/analyze`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text })
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'AI 분석에 실패했습니다.');
    }
    return response.json();
}
