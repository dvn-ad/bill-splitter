import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { InvoiceProvider } from "./context/InvoiceContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <InvoiceProvider>
        <App />
      </InvoiceProvider>
    </AuthProvider>
  </StrictMode>
);
