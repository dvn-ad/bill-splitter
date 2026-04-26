import React, { useState } from 'react'
import './App.css'
import InvoiceUpload from './components/Upload/InvoiceUpload'
import InvoiceDisplay from './components/Invoice/InvoiceDisplay'
import ChatInterface from './components/Chat/ChatInterface'

function App() {
  const [invoice, setInvoice] = useState(null)

  const handleUploadSuccess = (data) => {
    setInvoice(data)
  }

  return (
    <div className="app-container">
      <header>
        <h1>Split Bill AI Assistant</h1>
      </header>
      
      <main>
        {!invoice ? (
          <div className="welcome-screen">
            <InvoiceUpload onUploadSuccess={handleUploadSuccess} />
          </div>
        ) : (
          <div className="workspace">
            <div className="left-panel">
              <InvoiceDisplay data={invoice.data} />
            </div>
            <div className="right-panel">
              <ChatInterface invoiceId={invoice.id} invoiceData={invoice.data} />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
