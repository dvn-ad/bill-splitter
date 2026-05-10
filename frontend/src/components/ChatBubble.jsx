import { formatCurrency } from "../utils/currency.js";

function SplitTable({ result, currency, isUser }) {
  // If inside a user bubble (indigo bg), we want white text.
  // If inside assistant bubble (white bg in light, gray bg in dark), we want gray-900 in light, white in dark.
  return (
    <div className={`mt-4 overflow-hidden rounded-xl border transition-colors duration-300 ${
      isUser 
        ? "border-white/20 bg-white/10" 
        : "border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-black/20"
    }`}>
      <table className="w-full text-xs border-collapse">
        <tbody className={`divide-y ${isUser ? "divide-white/10" : "divide-gray-200 dark:divide-white/10"}`}>
          {Object.entries(result).map(([person, amount]) => (
            <tr key={person} className="transition-colors hover:bg-white/5">
              <td className={`px-3 py-2 font-semibold uppercase tracking-tight ${
                isUser ? "text-white/90" : "text-gray-600 dark:text-white/90"
              }`}>
                {person}
              </td>
              <td className={`px-3 py-2 text-right font-mono font-bold ${
                isUser ? "text-white" : "text-gray-900 dark:text-white"
              }`}>
                {formatCurrency(amount, currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ChatBubble({ role, content, operation, result, currency }) {
  const isUser = role === "user";
  const isAssistant = role === "assistant";

  return (
    <div className={`flex w-full mb-6 ${isUser ? "justify-end" : "justify-start animate-in slide-in-from-left-2 duration-300"}`}>
      <div className={`flex flex-col max-w-[85%] md:max-w-[70%] ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`px-4 py-3 rounded-2xl shadow-sm relative transition-all duration-300 ${
            isUser
              ? "bg-indigo-600 text-white rounded-tr-none hover:shadow-indigo-500/20"
              : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-black/50"
          }`}
        >
          {isAssistant && (
            <div className="flex items-center gap-1.5 mb-1.5 opacity-50">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Assistant</span>
            </div>
          )}
          
          <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
            {content}
          </p>

          {operation === "split_by_item" && result && typeof result === "object" && !Array.isArray(result) && (
            <SplitTable result={result} currency={currency} isUser={isUser} />
          )}
        </div>
        {isUser && (
          <span className="text-[10px] mt-1 px-1 font-medium text-gray-400 dark:text-gray-600 uppercase">
            You
          </span>
        )}
      </div>
    </div>
  );
}
