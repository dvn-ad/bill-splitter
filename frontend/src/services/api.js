import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const invoiceService = {
  upload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/invoice/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const chatService = {
  sendMessage: (invoiceId, message, invoiceData) => {
    return api.post('/chat/', {
      invoice_id: invoiceId,
      message,
      invoice_data: invoiceData,
    });
  },
};

export default api;
