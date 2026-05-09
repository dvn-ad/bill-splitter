import { formatCurrency } from "../utils/currency.js";

export default function InvoiceTable({ invoice }) {
  const { currency, items, subtotal, tax, service_charge, total } = invoice;
  const fmt = (n) => formatCurrency(n, currency);

  return (
    <div className="space-y-4">
      {/* Items Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400">Item</th>
                <th className="px-4 py-3 text-center font-semibold text-gray-600 dark:text-gray-400">Qty</th>
                <th className="px-4 py-3 text-right font-semibold text-gray-600 dark:text-gray-400">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
              {items.map((item, i) => (
                <tr key={i} className="group hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 dark:text-gray-100">{item.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">{fmt(item.price)} each</div>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400 font-medium">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-gray-100">
                    {fmt(item.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl p-5 border border-indigo-100 dark:border-indigo-900/30 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-indigo-300/70">Subtotal</span>
          <span className="font-medium text-gray-900 dark:text-indigo-100">{fmt(subtotal)}</span>
        </div>
        
        {(tax > 0 || service_charge > 0) && (
          <div className="pt-2 border-t border-indigo-200/50 dark:border-indigo-800/30 space-y-2">
            {tax > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-indigo-300/70">Tax</span>
                <span className="font-medium text-gray-900 dark:text-indigo-100">{fmt(tax)}</span>
              </div>
            )}
            {service_charge > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-indigo-300/70">Service Charge</span>
                <span className="font-medium text-gray-900 dark:text-indigo-100">{fmt(service_charge)}</span>
              </div>
            )}
          </div>
        )}

        <div className="pt-3 border-t-2 border-indigo-200/50 dark:border-indigo-800/50 flex justify-between items-center">
          <span className="text-base font-bold text-indigo-900 dark:text-indigo-300">Total Amount</span>
          <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">{fmt(total)}</span>
        </div>
      </div>
    </div>
  );
}
