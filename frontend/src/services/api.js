const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const handleResponse = async (res) => {
    if (!res.ok) {
        const error = await res.json().catch(() => ({error: 'Unknown error'}));
        throw new Error(error.error || 'Request failed');
    }
    if (res.status === 204) return null;
    return res.json();
};

export const getOrders = (status) => {
    const url = status
        ? `${BASE_URL}/api/orders?status=${status}`
        : `${BASE_URL}/api/orders`;
    return fetch(url).then(handleResponse);
};

export const getOrder = (id) =>
    fetch(`${BASE_URL}/api/orders/${id}`).then(handleResponse);

export const createOrder = (data) => 
    fetch(`${BASE_URL}/api/orders`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data),
    }).then(handleResponse);

export const updateOrder = (id, data) =>
    fetch(`${BASE_URL}/api/orders/${id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data),
    }).then(handleResponse);

export const deleteOrder = (id) =>
    fetch(`${BASE_URL}/api/orders/${id}`, {
        method: 'DELETE',
    }).then(handleResponse);

export const getCliients = () =>
    fetch(`${BASE_URL}/api/clients`).then(handleResponse);

export const createClient = (data) => 
    fetch(`${BASE_URL}/api/clients`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data),
    }).then(handleResponse);