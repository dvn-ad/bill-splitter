import { useEffect } from "react";
import { useAuth } from "./context/AuthContext.jsx";
import { setTokenProvider } from "./services/api.js";
import LoginPage from "./pages/LoginPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";

export default function App() {
  const { token } = useAuth();

  useEffect(() => {
    setTokenProvider(() => token);
  }, [token]);

  return token ? <ChatPage /> : <LoginPage />;
}
