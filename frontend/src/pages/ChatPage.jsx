import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useInvoice } from "../context/InvoiceContext.jsx";
import { api } from "../services/api.js";
import ChatWindow from "../components/ChatWindow.jsx";
import ChatInput from "../components/ChatInput.jsx";
import InvoiceTable from "../components/InvoiceTable.jsx";

function MoonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path fillRule="evenodd" d="M7.455 2.004a.75.75 0 01.26.77 7 7 0 009.958 7.967.75.75 0 011.067.853A8.5 8.5 0 116.647 1.921a.75.75 0 01.808.083z" clipRule="evenodd" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM10 7a3 3 0 100 6 3 3 0 000-6zM15.657 5.404a.75.75 0 10-1.06-1.06l-1.061 1.06a.75.75 0 001.06 1.06l1.061-1.06zM6.464 14.596a.75.75 0 10-1.06-1.06l-1.061 1.06a.75.75 0 001.06 1.06l1.061-1.06zM18 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0118 10zM5 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 015 10zM14.596 15.657a.75.75 0 001.06-1.06l-1.06-1.061a.75.75 0 10-1.06 1.06l1.06 1.061zM5.404 6.464a.75.75 0 001.06-1.06l-1.06-1.061a.75.75 0 10-1.06 1.06l1.06 1.061z" />
    </svg>
  );
}

export default function ChatPage({ dark, onToggleDark }) {
  const { logout } = useAuth();
  const { invoice, setInvoice, chatHistory, addMessage, updateInvoice } = useInvoice();
  const [busy, setBusy] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(true);

  const handleUpload = async (base64, mediaType) => {
    setBusy(true);
    addMessage("user", "Uploading receipt…");
    try {
      const res = await api.parseInvoice(base64, mediaType);
      setInvoice(res.data);
      addMessage("assistant", "Invoice loaded! Here's what I found. Feel free to ask me to split or analyze it.");
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
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Bill Splitter</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleDark}
            className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>
          <button
            onClick={logout}
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      {invoice && (
        <div className="px-4 pt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Receipt</span>
            <button
              onClick={() => setInvoiceOpen(o => !o)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              {invoiceOpen ? "Hide" : "Show"}
            </button>
          </div>
          {invoiceOpen && (
            <div className="max-h-52 overflow-y-auto">
              <InvoiceTable invoice={invoice} />
            </div>
          )}
        </div>
      )}

      <ChatWindow messages={chatHistory} />

      <ChatInput onSend={handleSend} onUpload={handleUpload} disabled={busy} />
    </div>
  );
}
