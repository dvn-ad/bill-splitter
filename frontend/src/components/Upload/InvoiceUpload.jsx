import React, { useState } from 'react';
import { invoiceService } from '../../services/api';

const InvoiceUpload = ({ onUploadSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const response = await invoiceService.upload(file);
      onUploadSuccess(response.data);
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload invoice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <h3>Upload Invoice</h3>
      <input type="file" onChange={handleFileChange} disabled={loading} />
      {loading && <p>Processing invoice with AI...</p>}
    </div>
  );
};

export default InvoiceUpload;
