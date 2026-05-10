import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useInvoice } from "../context/InvoiceContext.jsx";
import { api } from "../services/api.js";
import ChatWindow from "../components/ChatWindow.jsx";
import ChatInput from "../components/ChatInput.jsx";
import InvoiceTable from "../components/InvoiceTable.jsx";
import { Sun, Moon, Receipt, MessageSquare } from "lucide-react";

export default function ChatPage({ dark, onToggleDark }) {
  const { logout } = useAuth();
  const { invoice, setInvoice, chatHistory, addMessage, updateInvoice } = useInvoice();
  const [busy, setBusy] = useState(false);
  const [activeTab, setActiveTab] = useState("chat"); // 'chat' or 'invoice'

  // Auto-switch to invoice tab when a new invoice is uploaded
  useEffect(() => {
    if (invoice && chatHistory.length === 1 && chatHistory[0].role === "user" && chatHistory[0].content === "Uploading receipt…") {
       setActiveTab("invoice");
    }
  }, [invoice]);

  const handleUpload = async (base64, mediaType) => {
    setBusy(true);
    addMessage("user", "Uploading receipt…");
    try {
      const res = await api.parseInvoice(base64, mediaType);
      setInvoice(res.data);
      addMessage("assistant", "Invoice loaded! Check the 'Receipt' tab to see details, then ask me to split it.");
    } catch (err) {
      const detail = err.response?.data?.detail ?? "Could not read the image. Please try a clearer photo.";
      addMessage("assistant", `Error: ${detail}`);
    } finally {
      setBusy(false);
    }
  };

  const handleSend = async (message) => {
    if (!invoice) {
      addMessage("assistant", "Please upload an invoice first before asking questions.");
      return;
    }
    addMessage("user", message);
    setBusy(true);
    if (activeTab !== 'chat') setActiveTab('chat');
    
    try {
      const res = await api.sendMessage(message, invoice, chatHistory);
      const data = res.data;
      addMessage("assistant", data.explanation, data.operation, data.result);
      if (data.updated_invoice) {
        updateInvoice(data.updated_invoice);
      }
    } catch (err) {
      const detail = err.response?.data?.detail ?? "Something went wrong. Please try again.";
      addMessage("assistant", `Error: ${detail}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-gray-50 dark:bg-gray-950 font-sans transition-colors duration-300">
      {/* Header */}
      <header className="flex-none bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 md:px-8 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            Bill Splitter
          </h1>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={onToggleDark}
            className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-95"
            aria-label="Toggle Theme"
          >
            {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <div className="h-6 w-px bg-gray-200 dark:border-gray-800" />
          <button
            onClick={logout}
            className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Mobile Tab Navigation */}
        <div className="md:hidden absolute top-0 left-0 right-0 flex bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-10">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
              activeTab === "chat" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-500 dark:text-gray-400"
            }`}
          >
            <MessageSquare className="w-5 h-5" /> Chat
          </button>
          <button
            onClick={() => setActiveTab("invoice")}
            className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
              activeTab === "invoice" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-500 dark:text-gray-400"
            }`}
          >
            <Receipt className="w-5 h-5" /> Receipt
          </button>
        </div>

        {/* Invoice View (Sidebar on Desktop, Tab on Mobile) */}
        <div className={`
          flex-none w-full md:w-[400px] xl:w-[450px] border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-y-auto pt-14 md:pt-0 transition-all duration-300
          ${activeTab === "invoice" ? "block" : "hidden md:block"}
        `}>
          {invoice ? (
            <div className="p-4 md:p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Receipt className="w-5 h-5" /> Current Receipt
                </h2>
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold uppercase tracking-wider rounded">
                  Loaded
                </span>
              </div>
              <InvoiceTable invoice={invoice} />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-400">
                <Receipt className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-gray-900 dark:text-white font-semibold">No Receipt Uploaded</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Upload a photo of your bill to start splitting.</p>
              </div>
            </div>
          )}
        </div>

        {/* Chat View */}
        <div className={`
          flex-1 flex flex-col bg-gray-50 dark:bg-gray-950 pt-14 md:pt-0 transition-all duration-300
          ${activeTab === "chat" ? "block flex" : "hidden md:flex"}
        `}>
          <ChatWindow messages={chatHistory} />
          <ChatInput onSend={handleSend} onUpload={handleUpload} disabled={busy} />
        </div>
      </main>
    </div>
  );
}
