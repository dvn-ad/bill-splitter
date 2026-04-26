import React from 'react';

const InvoiceDisplay = ({ data }) => {
  if (!data) return null;

  return (
    <div className="invoice-display">
      <h2>{data.merchant_name}</h2>
      <p>Date: {data.date}</p>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>
              <td>{item.quantity}</td>
              <td>${item.price.toFixed(2)}</td>
              <td>${item.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="invoice-summary">
        <p>Subtotal: ${data.subtotal.toFixed(2)}</p>
        <p>Tax: ${data.tax.toFixed(2)}</p>
        <p>Service: ${data.service_charge.toFixed(2)}</p>
        <hr />
        <h3>Total: ${data.total.toFixed(2)}</h3>
      </div>
    </div>
  );
};

export default InvoiceDisplay;
