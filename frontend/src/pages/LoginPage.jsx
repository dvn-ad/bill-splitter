import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../services/api.js";
import { Sun, Moon } from "lucide-react";

export default function LoginPage({ onSwitch, dark, onToggleDark }) {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.login(username, password);
      login();
    } catch (err) {
      setError(
        err.response?.data?.detail ?? "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 transition-colors duration-300 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-indigo-300 dark:bg-indigo-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-300 dark:bg-purple-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 dark:bg-pink-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />

      <button
        onClick={onToggleDark}
        className="absolute top-6 right-6 p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 shadow-sm transition-all active:scale-95 z-10"
        title={dark ? "Switch to light mode" : "Switch to dark mode"}
      >
        {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <div className="w-full max-w-md z-10">
        <div className="flex flex-col items-center mb-10">
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight text-center">
            Welcome Back
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-center">
            The easiest way to split bills with friends.
          </p>
        </div>

        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white dark:border-gray-800 shadow-2xl rounded-3xl p-8 md:p-10 transition-all duration-300">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 px-1 uppercase tracking-wider">
                Username
              </label>
              <div className="relative group">
                <input
                  type="text"
                  className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl px-4 py-3 text-base text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-all"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 px-1 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                className="w-full bg-gray-50 dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-2xl px-4 py-3 text-base text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl p-3">
                <p className="text-sm text-red-600 dark:text-red-400 font-medium text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl py-4 text-base font-bold shadow-xl shadow-indigo-500/25 transition-all active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              New to Bill Splitter?{" "}
              <button
                onClick={() => onSwitch("register")}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              >
                Create an account
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
