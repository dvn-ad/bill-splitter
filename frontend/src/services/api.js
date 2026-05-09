import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

const client = axios.create({ baseURL: BASE_URL, withCredentials: true });

export const api = {
  login: (username, password) =>
    client.post("/auth/login", { username, password }),

  logout: () =>
    client.post("/auth/logout"),

  me: () =>
    client.get("/auth/me"),

  parseInvoice: (image_base64, media_type) =>
    client.post("/invoice/parse", { image_base64, media_type }),

  sendMessage: (message, invoice, history) =>
    client.post("/chat/message", { message, invoice, history }),
};
