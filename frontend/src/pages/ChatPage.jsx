import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useInvoice } from "../context/InvoiceContext.jsx";
import { api } from "../services/api.js";
import ChatWindow from "../components/ChatWindow.jsx";
import ChatInput from "../components/ChatInput.jsx";
import InvoiceTable from "../components/InvoiceTable.jsx";
import SplitBreakdown from "../components/SplitBreakdown.jsx";
import { Sun, Moon, Receipt, MessageSquare, History, Trash2 } from "lucide-react";


export default function ChatPage({ dark, onToggleDark }) {
  const { logout } = useAuth();
  const {
    invoice,
    setInvoice,
    activeInvoiceId,
    setActiveInvoiceId,
    chatHistory,
    setChatHistory,
    addMessage,
    updateInvoice,
    splitData,
    setSplitData,
  } = useInvoice();

  const [busy, setBusy] = useState(false);
  const [activeTab, setActiveTab] = useState("chat"); // 'chat', 'invoice', or 'history'
  const [sidebarTab, setSidebarTab] = useState("receipt"); // 'receipt' or 'history'
  const [savedInvoices, setSavedInvoices] = useState([]);

  const fetchSavedInvoices = async (currActiveId = null) => {
    try {
      const res = await api.getInvoices();
      const list = res.data;
      setSavedInvoices(list);
      
      const targetId = currActiveId || activeInvoiceId;
      if (targetId) {
        const active = list.find((inv) => inv.id === targetId);
        if (active) {
          setInvoice(active.invoice_data);
          setChatHistory(active.chat_history);
          setSplitData(active.split_data || null);
        }
      }
    } catch (err) {
      console.error("Failed to fetch saved invoices", err);
    }
  };

  useEffect(() => {
    fetchSavedInvoices();
  }, []);

  const handleUpload = async (base64, mediaType) => {
    setBusy(true);
    addMessage("user", "Uploading receipt…");
    try {
      const res = await api.parseInvoice(base64, mediaType);
      const saved = res.data;
      setInvoice(saved.invoice_data);
      setActiveInvoiceId(saved.id);
      setChatHistory(saved.chat_history);
      setSplitData(saved.split_data || null);

      setSidebarTab("receipt");
      setActiveTab("invoice");
      fetchSavedInvoices(saved.id);
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
    if (activeTab !== "chat") setActiveTab("chat");

    try {
      const res = await api.sendMessage(message, invoice, chatHistory, activeInvoiceId);
      const data = res.data;
      addMessage("assistant", data.explanation, data.operation, data.result);
      if (data.updated_invoice) {
        updateInvoice(data.updated_invoice);
      }
      await fetchSavedInvoices(activeInvoiceId);
    } catch (err) {
      const detail = err.response?.data?.detail ?? "Something went wrong. Please try again.";
      addMessage("assistant", `Error: ${detail}`);
    } finally {
      setBusy(false);
    }
  };

  const handleSelectInvoice = (savedInvoice) => {
    setInvoice(savedInvoice.invoice_data);
    setActiveInvoiceId(savedInvoice.id);
    setChatHistory(savedInvoice.chat_history);
    setSplitData(savedInvoice.split_data || null);
    setSidebarTab("receipt");
    setActiveTab("chat");
  };

  const handleDeleteInvoice = async (id, e) => {
    e.stopPropagation();
    try {
      await api.deleteInvoice(id);
      setSavedInvoices((prev) => prev.filter((inv) => inv.id !== id));
      if (activeInvoiceId === id) {
        setInvoice(null);
        setActiveInvoiceId(null);
        setChatHistory([]);
      }
    } catch (err) {
      console.error("Failed to delete invoice", err);
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
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
              activeTab === "history" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-gray-500 dark:text-gray-400"
            }`}
          >
            <History className="w-5 h-5" /> History
          </button>
        </div>

        {/* Invoice & History View (Sidebar on Desktop, Tab on Mobile) */}
        <div className={`
          flex-none w-full md:w-[400px] xl:w-[450px] border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col pt-14 md:pt-0 transition-all duration-300
          ${(activeTab === "invoice" || activeTab === "history") ? "block flex" : "hidden md:flex"}
        `}>
          {/* Sub-tabs switcher (Desktop only, hidden on mobile since mobile uses top navigation) */}
          <div className="hidden md:flex border-b border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-900/30 flex-none p-1.5 gap-1">
            <button
              onClick={() => setSidebarTab("receipt")}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 ${
                sidebarTab === "receipt"
                  ? "bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-gray-100 dark:border-gray-700/50"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/30 hover:text-gray-800 dark:hover:text-gray-200 border border-transparent"
              }`}
            >
              <Receipt className="w-3.5 h-3.5" /> Current Receipt
            </button>
            <button
              onClick={() => setSidebarTab("history")}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 ${
                sidebarTab === "history"
                  ? "bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-gray-100 dark:border-gray-700/50"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/30 hover:text-gray-800 dark:hover:text-gray-200 border border-transparent"
              }`}
            >
              <History className="w-3.5 h-3.5" /> History ({savedInvoices.length})
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {((activeTab === "invoice") || (activeTab !== "history" && sidebarTab === "receipt")) && (
              invoice ? (
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
                  <SplitBreakdown splitData={splitData} currency={invoice.currency} />
                </div>
              ) : (
                <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-400">
                    <Receipt className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 dark:text-white font-semibold">No Receipt Uploaded</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Upload a photo of your bill to start splitting.</p>
                  </div>
                </div>
              )
            )}

            {((activeTab === "history") || (activeTab !== "invoice" && sidebarTab === "history")) && (
              savedInvoices.length > 0 ? (
                <div className="p-4 md:p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <History className="w-5 h-5" /> Saved Bills
                    </h2>
                    <span className="px-2.5 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-semibold rounded-full">
                      {savedInvoices.length} total
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {savedInvoices.map((inv) => {
                      const isActive = activeInvoiceId === inv.id;
                      return (
                        <div
                          key={inv.id}
                          onClick={() => handleSelectInvoice(inv)}
                          className={`group relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex justify-between items-start ${
                            isActive
                              ? "bg-indigo-50/70 border-indigo-200 dark:bg-indigo-950/20 dark:border-indigo-900/50 shadow-sm"
                              : "bg-white border-gray-100 dark:bg-gray-900 dark:border-gray-800/60 hover:bg-gray-50 dark:hover:bg-gray-800/40 hover:border-gray-200 dark:hover:border-gray-700"
                          }`}
                        >
                          <div className="space-y-1 pr-6 flex-1">
                            <div className={`font-semibold text-sm transition-colors ${
                              isActive ? "text-indigo-700 dark:text-indigo-400" : "text-gray-800 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                            }`}>
                              {inv.name || `Invoice #${inv.id}`}
                            </div>
                            <div className="text-[11px] text-gray-400 dark:text-gray-500">
                              {new Date(inv.created_at).toLocaleString(undefined, {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </div>
                          </div>
                          <button
                            onClick={(e) => handleDeleteInvoice(inv.id, e)}
                            className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 active:scale-95"
                            title="Delete invoice"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-400">
                    <History className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 dark:text-white font-semibold">No Saved Bills</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Uploaded receipts will appear here.</p>
                  </div>
                </div>
              )
            )}
          </div>
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
