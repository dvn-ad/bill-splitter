import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useInvoice } from "../context/InvoiceContext.jsx";
import { api } from "../services/api.js";
import ChatWindow from "../components/ChatWindow.jsx";
import ChatInput from "../components/ChatInput.jsx";
import InvoiceTable from "../components/InvoiceTable.jsx";

export default function ChatPage() {
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
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-800">Bill Splitter</h1>
        <button
          onClick={logout}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Sign out
        </button>
      </header>

      {invoice && (
        <div className="px-4 pt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Receipt</span>
            <button
              onClick={() => setInvoiceOpen(o => !o)}
              className="text-xs text-blue-600 hover:underline"
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
