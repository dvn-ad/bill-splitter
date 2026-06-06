import { createContext, useContext, useState } from "react";

const InvoiceContext = createContext(null);

export function InvoiceProvider({ children }) {
  const [invoice, setInvoice] = useState(null);
  const [activeInvoiceId, setActiveInvoiceId] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [splitData, setSplitData] = useState(null);

  const addMessage = (role, content, operation = null, result = null) => {
    setChatHistory((prev) => [...prev, { role, content, operation, result }]);
  };

  const updateInvoice = (updated) => setInvoice(updated);

  return (
    <InvoiceContext.Provider
      value={{
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
      }}
    >
      {children}
    </InvoiceContext.Provider>
  );
}

export function useInvoice() {
  return useContext(InvoiceContext);
}

