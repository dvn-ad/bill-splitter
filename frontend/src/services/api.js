import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

const client = axios.create({ baseURL: BASE_URL });

// Add interceptor to include the token in every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  login: async (username, password) => {
    const res = await client.post("/auth/login", { username, password });
    if (res.data.access_token) {
      localStorage.setItem("token", res.data.access_token);
    }
    return res;
  },

  logout: async () => {
    const res = await client.post("/auth/logout").catch(() => ({}));
    localStorage.removeItem("token");
    return res;
  },

  me: () =>
    client.get("/auth/me"),

  parseInvoice: (image_base64, media_type) =>
    client.post("/invoice/parse", { image_base64, media_type }),

  register: (username, password) =>
    client.post("/auth/register", { username, password }),

  sendMessage: (message, invoice, history) =>
    client.post("/chat/message", { message, invoice, history }),
};
