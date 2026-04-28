import { formatCurrency } from "../utils/currency.js";

function SplitTable({ result, currency }) {
  return (
    <table className="mt-2 text-xs border-collapse w-full">
      <tbody>
        {Object.entries(result).map(([person, amount]) => (
          <tr key={person} className="border-b border-gray-200 last:border-0">
            <td className="pr-4 py-1 font-medium">{person}</td>
            <td className="py-1">{formatCurrency(amount, currency)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function ChatBubble({ role, content, operation, result, currency }) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl text-sm ${
          isUser
            ? "bg-blue-600 text-white rounded-br-sm"
            : "bg-gray-100 text-gray-800 rounded-bl-sm"
        }`}
      >
        <p className="whitespace-pre-wrap">{content}</p>
        {operation === "split_by_item" && result && typeof result === "object" && !Array.isArray(result) && (
          <SplitTable result={result} currency={currency} />
        )}
      </div>
    </div>
  );
}
