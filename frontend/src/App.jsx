import { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";

export default function App() {
  const { isLoggedIn, loading } = useAuth();
  const [page, setPage] = useState("login");
  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const toggleDark = () => setDark((d) => !d);

  if (loading) return null;
  if (isLoggedIn) return <ChatPage dark={dark} onToggleDark={toggleDark} />;
  if (page === "register") return <RegisterPage onSwitch={setPage} dark={dark} onToggleDark={toggleDark} />;
  return <LoginPage onSwitch={setPage} dark={dark} onToggleDark={toggleDark} />;
}
