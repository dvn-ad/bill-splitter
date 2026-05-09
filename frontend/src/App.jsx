import { useState } from "react";
import { useAuth } from "./context/AuthContext.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";

export default function App() {
  const { isLoggedIn, loading } = useAuth();
  const [page, setPage] = useState("login");

  if (loading) return null;
  if (isLoggedIn) return <ChatPage />;
  if (page === "register") return <RegisterPage onSwitch={setPage} />;
  return <LoginPage onSwitch={setPage} />;
}
