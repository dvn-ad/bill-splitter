import { formatCurrency } from "../utils/currency.js";

export default function InvoiceTable({ invoice }) {
  const { currency, items, subtotal, tax, service_charge, total } = invoice;
  const fmt = (n) => formatCurrency(n, currency);

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 text-sm">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <th className="px-4 py-2">Item</th>
            <th className="px-4 py-2 text-center">Qty</th>
            <th className="px-4 py-2 text-right">Unit Price</th>
            <th className="px-4 py-2 text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((item, i) => (
            <tr key={i} className="hover:bg-gray-50">
              <td className="px-4 py-2">{item.name}</td>
              <td className="px-4 py-2 text-center">{item.quantity}</td>
              <td className="px-4 py-2 text-right">{fmt(item.price)}</td>
              <td className="px-4 py-2 text-right">{fmt(item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-gray-50 divide-y divide-gray-200 text-gray-600">
          <tr>
            <td colSpan={3} className="px-4 py-1 text-right text-xs">Subtotal</td>
            <td className="px-4 py-1 text-right text-xs">{fmt(subtotal)}</td>
          </tr>
          {tax > 0 && (
            <tr>
              <td colSpan={3} className="px-4 py-1 text-right text-xs">Tax</td>
              <td className="px-4 py-1 text-right text-xs">{fmt(tax)}</td>
            </tr>
          )}
          {service_charge > 0 && (
            <tr>
              <td colSpan={3} className="px-4 py-1 text-right text-xs">Service Charge</td>
              <td className="px-4 py-1 text-right text-xs">{fmt(service_charge)}</td>
            </tr>
          )}
          <tr className="font-bold text-gray-800">
            <td colSpan={3} className="px-4 py-2 text-right">Total</td>
            <td className="px-4 py-2 text-right">{fmt(total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
