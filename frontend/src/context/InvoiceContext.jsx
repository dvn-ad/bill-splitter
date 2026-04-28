import { createContext, useContext, useState } from "react";

const InvoiceContext = createContext(null);

export function InvoiceProvider({ children }) {
  const [invoice, setInvoice] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);

  const addMessage = (role, content) => {
    setChatHistory((prev) => [...prev, { role, content }]);
  };

  const updateInvoice = (updated) => setInvoice(updated);

  return (
    <InvoiceContext.Provider
      value={{ invoice, setInvoice, chatHistory, addMessage, updateInvoice }}
    >
      {children}
    </InvoiceContext.Provider>
  );
}

export function useInvoice() {
  return useContext(InvoiceContext);
}
