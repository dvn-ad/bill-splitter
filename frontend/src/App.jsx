import { useAuth } from "./context/AuthContext.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";

export default function App() {
  const { isLoggedIn, loading } = useAuth();

  if (loading) return null;

  return isLoggedIn ? <ChatPage /> : <LoginPage />;
}
