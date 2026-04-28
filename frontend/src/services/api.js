import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

const client = axios.create({ baseURL: BASE_URL });

let _getToken = null;

export function setTokenProvider(fn) {
  _getToken = fn;
}

client.interceptors.request.use((config) => {
  const token = _getToken?.();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const api = {
  login: (username, password) =>
    client.post("/auth/login", { username, password }),

  parseInvoice: (image_base64, media_type) =>
    client.post("/invoice/parse", { image_base64, media_type }),

  sendMessage: (message, invoice, history) =>
    client.post("/chat/message", { message, invoice, history }),
};
